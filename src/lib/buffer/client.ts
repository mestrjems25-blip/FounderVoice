const BUFFER_GQL = "https://api.buffer.com/graphql";

export interface BufferChannel {
    id: string;
    name: string;
    service: string;
    avatar?: string;
}

export interface BufferPost {
    id: string;
    status: string;
}

function headers(): HeadersInit {
    const key = process.env.BUFFER_API_KEY;
    if (!key) throw new Error("BUFFER_API_KEY is not set");
    return {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
    };
}

async function gql<T>(query: string, variables?: Record<string, unknown>): Promise<T> {
    const res = await fetch(BUFFER_GQL, {
        method: "POST",
        headers: headers(),
        body: JSON.stringify({ query, variables }),
    });
    const json = await res.json() as { data?: T; errors?: Array<{ message: string }> };
    if (json.errors?.length) throw new Error(json.errors[0].message);
    if (!json.data) throw new Error("Empty response from Buffer API");
    return json.data;
}

async function getOrganizationId(): Promise<string> {
    const data = await gql<{ account: { organizations: Array<{ id: string }> } }>(
        `query { account { organizations { id } } }`
    );
    const orgs = data.account.organizations;
    if (!orgs?.length) throw new Error("No Buffer organizations found");
    return orgs[0].id;
}

export async function getChannels(): Promise<BufferChannel[]> {
    const organizationId = await getOrganizationId();
    const data = await gql<{ channels: BufferChannel[] }>(
        `query GetChannels($input: ChannelsInput!) { channels(input: $input) { id name service avatar } }`,
        { input: { organizationId } }
    );
    return data.channels;
}

const CREATE_POST_MUTATION = `
    mutation CreatePost($input: CreatePostInput!) {
        createPost(input: $input) {
            ... on PostActionSuccess {
                post { id status }
            }
        }
    }
`;

export async function createPost(channelId: string, text: string, scheduledAt?: string): Promise<BufferPost> {
    const input = scheduledAt
        ? { text, channelId, schedulingType: "automatic", mode: "customScheduled", dueAt: scheduledAt }
        : { text, channelId, schedulingType: "automatic", mode: "shareNow" };
    const data = await gql<{ createPost: { post: BufferPost } }>(CREATE_POST_MUTATION, { input });
    return data.createPost.post;
}

export async function createThread(channelId: string, tweets: string[], scheduledAt?: string): Promise<BufferPost> {
    const input = scheduledAt
        ? { channelId, schedulingType: "automatic", mode: "customScheduled", dueAt: scheduledAt, thread: tweets.map((text) => ({ text })) }
        : { channelId, schedulingType: "automatic", mode: "shareNow", thread: tweets.map((text) => ({ text })) };
    const data = await gql<{ createPost: { post: BufferPost } }>(CREATE_POST_MUTATION, { input });
    return data.createPost.post;
}
