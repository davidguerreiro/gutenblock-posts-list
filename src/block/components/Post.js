export const Post = ({ title: { rendered: postTitle } = {}, clickHandler, id: postId, featured_image = false, icon }) => (
		<article className="post">
			<figure className="post-figure" style={{ backgroundImage: `url(${featured_image})` }}>
			</figure>
			<div className="post-body">
				<h3 className="post-title">{postTitle}</h3>
			</div>
			<button onClick={() => clickHandler(postId)}>{icon}</button>
		</article>
);
