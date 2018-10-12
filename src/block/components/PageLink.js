//import * as api from './../utils/api';

const { Component } = wp.element;

export class PageLink extends Component {
	constructor(props) {
		super(...arguments);

		this.props = props;

		this.state = {
			linkText: '',
			pageLink: null,
		};
	}

	render() {
		const { linkText, pageLink } = this.state;
		return (
			<div className="pagelink pagelink__wrapper">
				<div className="pagelink__element">
					<label for="link-label">Link Text: </label>
					<input type="text" value={linkText} name="link-label" id="link-label" onChange={e => this.setState({linkText: e.target.value})}/>
				</div>
				<div className="pagelink__element">
					<label for="pagelink-page">Page Link: </label>
					<select name="pagelink-page" class="pagelink__page-selector" id="pagelink-page">
						<option value="">Page 1</option>
						<option value="">Page 2</option>
					</select>
				</div>
			</div>
		);
	}
}
