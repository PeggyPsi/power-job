export interface AppWebhookData<T> {
	data: T;
}

export interface JobListingApplicationJSON {
	jobListingId: string;
	userId: string;
}

export interface UserResumeUploadedJSON {
	userId: string;
}