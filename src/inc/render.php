<?php

/**
 * Create filter to get block data in the backend
 *
 * @param array $attributes
 * @return boolean
 */

function bb_render_post_list_block( $attributes ) {
	$block_title = isset( $attributes['blockTitle'] ) ? $attributes['blockTitle'] : false;
	$selected_posts = isset( $attributes['selectedPosts'] ) ? $attributes['selectedPosts'] : false;

	$object_query = new WP_Query([
		'post__in' => $selected_posts,
		'post_type' => get_post_types(),
		'order_by' => 'posts__in',
	]);

return apply_filters( 'guten-post-list_render_filter', $object_query, $block_title );
}

/**
 * Returns the HTML for the post list from the query provided.
 *
 * @param WP_Query $query - Post query of the selected posts.
 * @param string $title - The block title.
 * @return mixed
 */
function render_guten_post_list_filter( $query, $title ) {

	if ( ! $query->have_posts() ) {
		return;
	}

	ob_start(); ?>

	<h2><?php echo esc_html( $title ); ?></h2>

	<?php while( $query->have_posts() ) :
		$query->the_post();
	?>
		<article>
			<?php the_title(); ?>
		</article>
	<?php
	endwhile;
	return ob_get_clean();
}
