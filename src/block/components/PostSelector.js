import { PostList } from './PostList';
import * as api from './../utils/api';
import { uniqueByID, debounce } from './../utils/useful-funcs';

const { Component } = wp.element;
const { BlockIcon } = wp.editor;
console.log(wp.editor);



export class PostSelector extends Component {
	/**
	 * Class constructor.
	 *
	 * @param {object} props
	 */
	constructor(props) {
		super(...arguments);
		this.props = props;

		this.state = {
			posts: [],
			loading: false,
			type: 'post',
			types: [],
			superState: true,
			filter: '',
			filterLoading: false,
			filterPosts: [],
			pages: {},
			pagesTotal: {},
			paging: false,
			initialLoading: false,
		};

		// bind 'this' to force class methods to use this 'this'
		this.addPost = this.addPost.bind(this);
		this.getPosts = this.getPosts.bind(this);
		this.deletePost = this.deletePost.bind(this);
		this.handlePostTypeChange = this.handlePostTypeChange.bind(this);
		this.handleInputFilterChange = this.handleInputFilterChange.bind(this);
		this.doPostFilter = debounce(this.doPostFilter.bind(this), 300);
		this.doPagination = this.doPagination.bind(this);
		this.retrieveSelectedPosts = this.retrieveSelectedPosts.bind(this);
	}

	/**
	 * Load CPTs on the filter select as soon as the
	 * component is mount.
	 */
	componentDidMount() {
		this.setState({
			loading: true,
			initialLoading: true,
		});

		api.getPostTypes()
			.then( ( { data = {} } = {} ) => {
				delete data.attachment;
				delete data.wp_block;
				this.setState({
					types: data
				}, () => {
					this.retrieveSelectedPosts()
						.then(() => {
							this.setState({
								initialLoading: false,
							});
							this.getPosts()
								.then(() => {
									this.setState({ loading: false })
								} );
						})
				})
			})

	}

	/**
	 * Get those posts which has already been selected.
	 * Used for when the component is refreshed after
	 * filtering / pagination.
	 */
	retrieveSelectedPosts() {
		const selected = this.props.selectedPosts;
		const { types } = this.state;

		if (selected.length <= 0) {
			// return a fake promise that auto resolves
			return new Promise((resolve) => resolve());
		}

		return Promise.all(Object.keys(types).map( type => this.getPosts({
				include: this.props.selectedPosts.join(','),
				per_page: 100,
				type
			})
		));
	}

	/**
	 * Get posts from WP Database using WP Rest API
	 *
	 * @param {object} args
	 */
	getPosts(args = {}) {
		const pageKey = this.state.filter ? false : this.state.type;
		const defaultArgs = {
			per_page: 10,
			type: this.state.type,
			search: this.state.filter,
			page: this.state.pages[pageKey] || 1,
		};

		const requestArguments = {
			...defaultArgs,
			...args,
		};

		requestArguments.restBase = this.state.types[requestArguments.type].rest_base;

		// get the posts from api.getPosts ( see ./utils/api.js ) using the arguments we have just defined above.
		return api.getPosts(requestArguments)
				.then(response => {
					const { data } = response;
					const posts = data.map(p => {
						if (!p.featured_media || p.featured_media < 1) {
							return {
								...p,
								featured_image: false
							};
						}

						return {
							...p,
							featured_image: p._embedded['wp:featuredmedia'][0].source_url || false,
						};
					});

					return {
						...response,
						data: posts,
					};

				})
				.then(response => {
					// get search posts only
					if (requestArguments.search) {
						this.setState({
							filterPosts: requestArguments.page > 1 ? uniqueById([...this.state.filterPosts, ...response.data]) : response.data,
							pages: {
								...this.state.pages,
								filter: requestArguments.page,
							},
							pagesTotal: {
								...this.state.pagesTotal,
								filter: response.headers['x-wp-totalpages'],
							}
						});

						return response;
					}
					this.setState({
						posts: uniqueByID([...this.state.posts, ...response.data]),
						pages: {
							...this.state.pages,
							[pageKey]: requestArguments.page
						},
						pagesTotal: {
							...this.state.pagesTotal,
							[pageKey]: response.headers['x-wp-totalpages'],
						}
					});

					return response;
				});
	}

	/**
	 * Adds a post to the right column.
	 *
	 * @param {number} post_id
	 */
	addPost(post_id) {

		// if filtering - get the posts from the filtered posts and uptate posts state.
		if (this.state.filter) {
			const post = this.state.filterPosts.filter(p => p.id === post_id);
			const posts = uniqueByID([
				...this.state.posts,
				...post
			]);

			this.setState({
				posts
			});
		}

		this.props.updateSelectedPosts([
			...this.props.selectedPosts,
			post_id
		]);
	}

	/**
	 * Removes posts from the right column
	 *
	 * @param {number} post_id
	 */
	deletePost(post_id) {
		this.props.updateSelectedPosts([
			...this.props.selectedPosts
		].filter(id => id !== post_id));
	}

	/**
	 * Displays selected posts in the right column.
	 */
	getSelectedPosts() {
		const { selectedPosts } = this.props;
		return this.state.posts
			.filter(({ id }) => selectedPosts.indexOf(id) !== -1)
			.sort((a, b) => {
				const aIndex = this.props.selectedPosts.indexOf(a.id);
				const bIndex = this.props.selectedPosts.indexOf(b.id);

				if (aIndex > bIndex) {
					return 1;
				}

				if (aIndex < bIndex) {
					return -1;
				}

				return 0;
			});
	}
	/**
	 * Handles select value when the option changes.
	 * Refresh posts list.
	 *
	 * @param {object} type
	 */
	handlePostTypeChange({ target: { value: type = '' } = {} } = {}) {
		this.setState({ type, loading: true }, () => {
			// fetch posts, then set loading = false
			this.getPosts()
				.then(() => this.setState({loading: false}));
		});
	}


	/**
	 * Handles filter input change.
	 *
	 * @param {obkect} param0
	 */
	handleInputFilterChange({ target: { value: filter = ''} = {} }) {
		this.setState({
			filter
		},() => {
			if ( ! filter ) {
				// remove filtered posts if no value is being used.
				return this.setState({ filteredPosts: [], filtering: false});
			}

			this.doPostFilter();
		});
	}

	/**
	 * Wrapper to get posts. Used when the search
	 * input value changes.
	 */
	doPostFilter() {
		const { filter = '' } = this.state;

		if (!filter) {
			return;
		}

		this.setState({
			filtering: true,
			filterLoading: true,
		});

		this.getPosts()
			.then(() => {
				this.setState({
					filterLoading: false
				});
			});
	}

	/**
	 * Load more posts when there are more pages
	 * to display
	 */
	doPagination() {
		this.setState({
			paging: true,
		});

		const pageKey = this.state.filter ? 'filter' : this.state.type;
		const page = parseInt(this.state.pages[pageKey], 10) + 1 || 2;

		this.getPosts({page})
			.then(() => this.setState({
				paging: false,
			}));
	}

	/**
	 * Renders component layout on the screen.
	 */
	render() {
		const pageKey = this.state.filter ? 'filter' : this.state.type;
		const canPaginate = (this.state.pages[pageKey] || 1) < this.state.pagesTotal[pageKey];
		const isFiltered = this.state.filtering;
		const postList = isFiltered && !this.state.filterLoading ? this.state.filterPosts : this.state.posts.filter(post => post.type === this.state.type);

		const addIcon = <BlockIcon icon="plus" />
		const removeIcon = <BlockIcon icon="minus" />

		return(
			<div className="post-selector">
				<div className="post-selectorHeader">
					<div className="searchbox">
						<label htmlFor="searchinput">
							<BlockIcon icon="search"/>
							<input id="searchinput" type="search" placeholder={"Please enter your search query..."}
								value={this.state.filter} onChange={this.handleInputFilterChange}/>
						</label>
					</div>
					<div className="filter">
						<label htmlFor="options">Post Type: </label>
						<select name="options" id="options" onChange={this.handlePostTypeChange}>
						{ this.state.types.length < 1 ?
							(<option value="">loading</option>) :
							Object.keys(this.state.types).map(
									key =>
									<option key={key} value={key}>{this.state.types[key].name}</option>
							)
						}
						</select>
					</div>
				</div>
				<div className="post-selectorContainer">
					<PostList posts={postList}
							  loading={this.state.initialLoading || this.state.loading || this.state.filterLoading}
							  action={this.addPost}
							  filtered={isFiltered}
							  paging={this.state.paging}
							  canPaginate={canPaginate}
							  doPagination={this.doPagination}
							  icon={addIcon}
					/>
					<PostList 	posts={this.getSelectedPosts()}
								loading={this.state.initialLoading}
								action={this.removePost}
								icon={removeIcon}
								/>
				</div>
			</div>
		);
	}
}
