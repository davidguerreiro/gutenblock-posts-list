/**
 * Class not be used in this funcitonal component
 * because state will be managed by parent PostSelector component
 */

import { Post } from './Post';

 export const PostList = props => {
	 const { loading = false, posts = [], action = () => {} } = props;
	 console.log( posts );

	 if ( loading ) {
		 return <p>Loading posts...</p>
	 }

	 if ( ! posts || posts.length < 1 ) {
		 return <p>No posts.</p>
	 }

	 return (
		<div className="post-list">
           {posts.map((post) => <Post key={post.id} {...post} clickHandler={action} />)}
        </div>
	 );
}

