/**
 * Class not be used in this funcitonal component
 * because state will be managed by parent PostSelector component
 */

import { Post } from './Post';

 export const PostList = props => {
	 return (
		<div className="post-list">
            <article className="post">
                <figure className="post-figure" style={{ backgroundImage: `//satyr.io/150` }}>
                </figure>
                <div className="post-body">
                    <h3 className="post-title">Post 2</h3>
                </div>
                <button>+/-</button>
            </article>
        </div>
	 );
}

