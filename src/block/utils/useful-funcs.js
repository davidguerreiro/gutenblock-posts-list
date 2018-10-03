// some handy functions to provide support to basic funcionality

/**
 * Filter posts to avoid duplicated posts when
 * using the post type select filter.
 */
export const uniqueBy = (arr, key) => {
	let keys = [];
	return arr.filter(item => {
		if (keys.indexOf(item[key]) !== -1) {
			return false;
		}

		return keys.push(item[key]);
	});
}

// uniqueBy consumer.
export const uniqueByID = arr => uniqueBy(arr, 'id');
