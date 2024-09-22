export type Item = {
  id: number;
  deleted: boolean;
  type: "job" | "story" | "comment" | "poll" | "pollopt";
  by: string;
  time: number; // created at, unix time
  dead: boolean;
  parent: string; // either another comment or relevant story
  poll: string; // poll option's associated poll
  kids: number[]; // id's of comments, ranked in display order
  url: string;
  score: number; // store score or votes
  title: string;
  text: string;
  parts: number[]; // list of pollopts
  descendants: number; // total comment count
};

export const HN = Object.freeze({
  url: "https://hacker-news.firebaseio.com/v0",
  async getItemByID(id: number) {
    return fetch(`${this.url}/item/${id}.json`)
      .then((r) => r.json() as unknown as Item)
      .then((j) => {
        return j;
      });
  },
  async getItemsByIDs(ids: number[]) {
    return Promise.all(ids.map((id) => this.getItemByID(id)));
  },
  async getTopStories(limit?: number) {
    return this.getItemsByIDs(
      (await this._getLiveIDs("topstories")).slice(0, limit)
    );
  },
  async getJobItems(limit?: number) {
    return (
      await this.getItemsByIDs(await this._getLiveIDs("jobstories"))
    ).slice(0, limit);
  },
  async _getLiveIDs(page: string) {
    return fetch(`${this.url}/${page}.json`)
      .then((r) => {
        return r.json() as unknown as number[];
      })
      .then((j) => {
        return j;
      });
    // todo: error handling
  },
});
