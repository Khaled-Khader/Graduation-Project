import { http } from "../util/http";

export function fetchPostsFeed({ type, pageParam = 0, size = 10 }) {
    const params = new URLSearchParams({
        page: pageParam,
        size,
    });

    return http(`/post/feed/${type}?${params.toString()}`).then((res) => {
        return res;
    });
}

