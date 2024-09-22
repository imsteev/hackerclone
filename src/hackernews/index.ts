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

export type Story = "new" | "top" | "best" | "ask" | "show" | "job";

export const HN = Object.freeze({
  url: "https://hacker-news.firebaseio.com/v0",

  async getItemByID(id: number): Promise<Item> {
    return fetch(`${this.url}/item/${id}.json`)
      .then((r) => r.json() as unknown as Item)
      .then((j) => {
        return j;
      });
  },
  async getItemsByIDs(ids: number[]) {
    return Promise.all(ids.map((id) => this.getItemByID(id)));
  },

  async getNew(limit?: number) {
    return this.getItemsByIDs(await this._getLiveDataIDs("new", limit));
  },
  async getTop(limit?: number) {
    return this.getItemsByIDs(await this._getLiveDataIDs("top", limit));
  },
  async getBest(limit?: number) {
    return this.getItemsByIDs(await this._getLiveDataIDs("best", limit));
  },
  async getAskHN(limit?: number) {
    return this.getItemsByIDs(await this._getLiveDataIDs("ask", limit));
  },
  async getShowHN(limit?: number) {
    return this.getItemsByIDs(await this._getLiveDataIDs("show", limit));
  },
  async getJobs(limit?: number) {
    return this.getItemsByIDs(await this._getLiveDataIDs("job", limit));
  },

  /**
   * The HN API has endpoints that return the latest N item ids for things like
   * news, or best stories.
   *
   * According to docs:
   *  N <= 500 for New, Top, and Best Stories
   *  N <= 200 for Ask, Show, and Job stories
   *
   * More here: https://github.com/HackerNews/API?tab=readme-ov-file#live-data
   */
  async _getLiveDataIDs(page: Story, limit?: number, offset?: number) {
    return fetch(`${this.url}/${page}stories.json`)
      .then((r) => {
        return r.json() as unknown as number[];
      })
      .then((j) => {
        return j.slice(offset ?? 0, limit);
      });
    // todo: error handling
  },
});

export class Paginator {
  ids!: number[];
  currentPage: number; // current is where the paginator should start loading from when next gets called
  totalPages: number;

  constructor(private limit: number) {
    this.currentPage = 0;
    this.limit = limit;
    this.ids = [];
    this.totalPages = 0;
  }

  withIDs(ids: number[]) {
    this.ids = ids;
    this.totalPages = Math.floor(this.ids.length / this.limit);
  }

  async load(): Promise<Item[]> {
    const [start, end] = this.getStartAndEnd(this.currentPage);
    if (start < 0 || end > this.ids.length) {
      throw new Error("Paginator has gone out of bounds");
    }
    const result = await HN.getItemsByIDs(this.ids.slice(start, end));
    return result;
  }

  async next(): Promise<Item[]> {
    const [start, end] = this.getStartAndEnd(this.currentPage + 1);
    if (end > this.ids.length) {
      throw new Error("Paginator has gone out of bounds");
    }
    const result = await HN.getItemsByIDs(this.ids.slice(start, end));
    this.currentPage++;
    return result;
  }

  async previous(): Promise<Item[]> {
    const [start, end] = this.getStartAndEnd(this.currentPage - 1);
    if (start < 0) {
      throw new Error("Paginator has gone out of bounds");
    }
    const result = HN.getItemsByIDs(this.ids.slice(start, end));
    this.currentPage--;
    return result;
  }

  hasNext(): boolean {
    return this.currentPage < this.totalPages;
  }

  hasPrevious(): boolean {
    return this.currentPage > 0;
  }

  private getStartAndEnd(page: number) {
    return [
      Math.max(page * this.limit, 0),
      Math.min(page * this.limit + this.limit, this.ids.length),
    ];
  }
}
