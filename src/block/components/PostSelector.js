import { Postslist } from './PostList';

const { Component } = wp.element;


export class PostSelector extends Component {
	constructor(props) {
		super(...arguments);
		this.props = props;
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
						<select name="options" id="options">
							<option>Loading Post types</option>
						</select>
					</div>
				</div>
				<div className="post-selectorContainer">
					<PostList />
					<PostList />
				</div>
			</div>
		);
	}
}
