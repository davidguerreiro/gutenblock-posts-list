import { PostList } from './PostList';
import * as api from './../utils/api';
import { uniqueByID, debounce } from './../utils/useful-funcs';

const { Component } = wp.element;


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
		};

		// bind 'this' to force class methods to use this 'this'
		this.addPost = this.addPost.bind(this);
		this.getPosts = this.getPosts.bind(this);
		this.deletePost = this.deletePost.bind(this);
		this.handlePostTypeChange = this.handlePostTypeChange.bind(this);
		this.handleInputFilterChange = this.handleInputFilterChange.bind(this);
		this.doPostFilter = debounce(this.doPostFilter.bind(this), 300);
	}

	/**
	 * Load CPTs on the filter select as soon as the
	 * component is mount.
	 */
	componentDidMount() {
		this.setState({
			loading: true,
		});

		api.getPostTypes()
			.then( ( { data = {} } = {} ) => {
				delete data.attachment;
				delete data.wp_block;
				this.setState({
					types: data,
				}, () => {
						this.getPosts()
							.then(() => this.setState({loading: false}));
				});
			});


	}

	/**
	 * Get posts from WP Database using WP Rest API
	 *
	 * @param {object} args
	 */
	getPosts(args = {}) {
		const defaultArgs = {
			per_page: 10,
			type: this.state.type,
			search: this.state.filter,
		};

		const requestArguments = {
			...defaultArgs,
			...args,
		};

		requestArguments.restBase = this.state.types[requestArguments.type].rest_base;

		// get the posts from api.getPosts ( see ./utils/api.js ) using the arguments we have just defined above.
		return api.getPosts(requestArguments)
				.then(response => {
					// get search posts only
					if (requestArguments.search) {
						this.setState({
							filterPosts: response.data
						});

						return response;
					}
					this.setState({
						posts: uniqueByID([...this.state.posts, ...response.data]),
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
	 * Renders component layout on the screen.
	 */
	render() {
		const isFiltered = this.state.filtering;
		const postList = isFiltered && !this.state.filterLoading ? this.state.filterPosts : this.state.posts.filter(post => post.type === this.state.type);
		return(
			<div className="post-selector">
				<div className="post-selectorHeader">
					<div className="searchbox">
						<label htmlFor="searchinput">
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
							  loading={this.state.loading || this.state.filterLoading} action={this.addPost}
							  filtered={isFiltered}
					/>
					<PostList posts={this.getSelectedPosts()} loading={this.state.loading} action={this.removePost}/>
				</div>
			</div>
		);
	}
}
