import { faker } from "@faker-js/faker";

export function buildPullRequests({
	max = 10,
	labels = [],
	org = "aws-powertools",
	repo = "powertools-lambda-python",
}) {
	const pullRequests = [];

	for (let i = 0; i < max; i++) {
		const pullRequest = {
			id: `#${i + 1}`,
			number: i + 1,
			html_url: `https://github.com/${org}/${repo}/pull/${i}`,
			diff_url: `https://github.com/${org}/${repo}/pull/${i}.diff`,
			patch_url: `https://github.com/${org}/${repo}/pull/${i}.patch`,
			issue_url: `https://github.com/${org}/${repo}/issues/${i}`,
			status: faker.helpers.arrayElement(["open", "merged"]),
			title: faker.commerce.productName(),
			description: faker.lorem.paragraphs(2),
			author: {
				name: faker.person.fullName(),
				username: faker.internet.userName(),
				avatar: faker.image.avatar(),
			},
			created_at: faker.date.recent({ days: 5 }),
			updated_at: faker.date.recent({ days: 1 }),
			mergedAt: null,
			comments: Array.from({ length: faker.number.int({ min: 0, max: 10 }) }, () => ({
				id: faker.string.uuid(),
				author: {
					name: faker.person.fullName(),
					username: faker.internet.userName(),
					avatar: faker.image.avatar(),
				},
				content: faker.lorem.sentence(),
				created_at: faker.date.recent({ days: 5 }),
			})),
			labels: labels.map((label) => ({
				id: faker.string.uuid(),
				name: label,
				color: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
			})),
			requested_reviewers: Array.from({ length: faker.number.int({ min: 1, max: 3 }) }, () => ({
				name: faker.person.fullName(),
				username: faker.internet.userName(),
				avatar: faker.image.avatar(),
				login: faker.internet.userName(),
			})),
			reviewers: Array.from({ length: faker.number.int({ min: 1, max: 3 }) }, () => ({
				name: faker.person.fullName(),
				username: faker.internet.userName(),
				avatar: faker.image.avatar(),
				login: faker.internet.userName(),
			})),
		};

		pullRequests.push(pullRequest);
	}

	return pullRequests;
}
