import { APIResponse } from '../types/api.js';

const SERVER_URL = 'https://cocottejs.com/';
// const SERVER_URL = 'http://localhost:5173/';
const PRIVATE_API_URL = `${SERVER_URL}api/get`;

export class APIService {
	static async getPrivateInstructions(
		identifier: string,
		projectDir: string,
		token: string
	): Promise<APIResponse> {
		try {
			const response = await fetch(
				`${PRIVATE_API_URL}/${identifier}:${encodeURIComponent(projectDir)}`,
				{
					headers: {
						Authorization: `Bearer ${token}`,
					},
				}
			);
			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}
			return await response.json();
		} catch (error) {
			throw new Error(
				`Failed to fetch private instructions: ${error instanceof Error ? error.message : 'Unknown error'}`
			);
		}
	}
}
