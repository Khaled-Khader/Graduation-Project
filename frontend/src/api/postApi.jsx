import { http } from "../util/http";

export function fetchPostsFeed({ type, pageParam = 0, size = 10, sortBy = "latest" }) {
    const params = new URLSearchParams({
        page: pageParam,
        size,
        sortBy,
    });

    return http(`/post/feed/${type}?${params.toString()}`).then((res) => {
        return res;
    });
}

