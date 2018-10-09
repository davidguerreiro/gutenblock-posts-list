/**
 * Class not be used in this funcitonal component
 * because state will be managed by parent PostSelector component
 */

import { Post } from './Post';

 export const PostList = props => {
	const { filtered = false, loading = false, posts = [], action = () => {}, icon = null } = props;

	// content displaying while loading results.
	 if ( loading ) {
		 return <p>Loading posts...</p>
	 }

	 // content displayed when there are no results.
	 if ( ! posts || posts.length < 1 ) {
		 return <p>No posts.</p>
	 }

	 // content displayed when there are no search results
	 if( filtered && posts.length < 1 ) {
		 return(
			 <div className="post-list">
				<p>Your query yielded no results, please try again</p>
			 </div>
		 );
	 }

	 return (
		<div className="post-list">
		   {posts.map((post) => <Post key={post.id} {...post} clickHandler={action} icon={icon} />)}
		   {props.canPaginate ? (<button onClick={props.doPagination} disabled={props.paging}>{props.paging ? 'Loading ...' : 'Load more'}</button>) : null}
        </div>
	 );
}

