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

/**
 * Debouncer function to limit / kill
 * the amoun of asyn requests tiggered by the
 * gutem block.
 */
export const debounce = (func, wait) => {
	let timeout = null;

	return function() {
		const context = this;
		const args = arguments;

		const later = () => {
			func.apply(context, args);
		};

		clearTimeout(timeout);
		timeout = setTimeout(later, wait);
	}
};
