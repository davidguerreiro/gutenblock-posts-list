export const Post = ({ title: { rendered: postTitle } = {}, clickHandler, id: postId }) => (
		<article className="post">
			<figure className="post-figure" style={{ backgroundImage: `//satyr.io/150` }}>
			</figure>
			<div className="post-body">
				<h3 className="post-title">{postTitle}</h3>
			</div>
			<button onClick={() => clickHandler(postId)}>+/-</button>
		</article>
);
