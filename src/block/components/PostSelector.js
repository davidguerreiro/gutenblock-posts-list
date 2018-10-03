import { PostList } from './PostList';
import * as api from './../utils/api';

const { Component } = wp.element;


export class PostSelector extends Component {
	constructor(props) {
		super(...arguments);
		this.props = props;

		this.state = {
			posts: [],
			loading: false,
			type: 'post',
			types: [],
		};

		this.getPosts = this.getPosts.bind(this);
		this.deletePost = this.deletePost.bind(this);
		this.handlePostTypeChange = this.handlePostTypeChange.bind(this);
	}

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

	getPosts(args = {}) {
		const defaultArgs = {
			per_page: 10,
			type: this.state.type,
		};

		const requestArguments = {
			...defaultArgs,
			...args,
		};

		requestArguments.restBase = this.state.types[requestArguments.type].rest_base;

		// get the posts from api.getPosts ( see ./utils/api.js ) using the arguments we have just defined above.
		return api.getPosts(requestArguments)
				.then(response => {
					this.setState({
						posts: [...this.state.posts, ...response.data],
					});
					console.log(this.state.posts);
					return response;
				});
	}

	addPost(post_id) {
		this.props.updateSelectedPosts([
			...this.props.selectedPosts,
			post_id
		]);
	}

	deletePost(post_id) {
		this.props.updateSelectedPosts([
			...this.props.selectedPosts
		].filter(id => id !== post_id));
	}

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

	handlePostTypeChange({ target: { value:type = '' } = {} } = {}) {
		// fetch posts, then set loading = false.
		this.getPosts()
			.then(() => this.setState({ loading: false}));
	}

	render() {
		return(
			<div className="post-selector">
				<div className="post-selectorHeader">
					<div className="searchbox">
						<label htmlFor="searchinput">
							<input id="searchinput" type="search" placeholder={"Please enter your search query..."} />
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
					<PostList posts={this.state.posts.filter(post => post.type === this.state.type)}
							  loading={this.state.loading} action={this.addPost}
					/>
					<PostList posts={this.getSelectedPosts()} loading={this.state.loading} action={this.removePost}/>
				</div>
			</div>
		);
	}
}
