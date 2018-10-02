import axios from 'axios';

// get post types.
export const getPostTypes = () => axios.get('/theme-plugins/wp-json/wp/v2/types');

// get posts.
export const getPosts = ({ restBase = false, ...args }) => {
	const queryString = Object.keys(args).map(arg => `${arg}=${args[arg]}`).join('&');
	return axios.get(`/theme-plugins/wp-json/wp/v2/${restBase}?${queryString}&_embed`);
}
