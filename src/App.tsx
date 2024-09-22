import {
  Text,
  Button,
  Card,
  Flex,
  Heading,
  Table,
  Separator,
  Tabs,
  Link,
} from "@radix-ui/themes";
import { useCallback, useState } from "react";
import { HN, Item } from "./clients/hackernews";

function App() {
  const [loading, setLoading] = useState(false);
  const [topStories, setTopStories] = useState<Item[]>([]);
  const [jobs, setJobs] = useState<Item[]>([]);

  const fetchTopHN = useCallback(async () => {
    setLoading(true);
    try {
      const stories = await HN.getTopStories(10);
      setTopStories(stories);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchJobsHN = useCallback(async () => {
    setLoading(true);
    try {
      const jobs = await HN.getJobItems(10);
      setJobs(jobs);
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <>
      <Heading size="9">HackerClone</Heading>
      <Tabs.Root defaultValue="topstories">
        <Tabs.List>
          <Tabs.Trigger value="topstories">Top Stories</Tabs.Trigger>
          <Tabs.Trigger value="jobs">Jobs</Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content value="topstories">
          <Button loading={loading} onClick={fetchTopHN} mt="4">
            Load
          </Button>
          <Flex direction="column" gap="4" mt="4">
            {topStories.map((s) => (
              <Card>
                <Flex gap="2" align="center">
                  {s.title} <Separator orientation="vertical" />{" "}
                  <Text style={{ color: "var(--gray-10)" }}>
                    {s.kids?.length || 0} comments
                  </Text>
                </Flex>
                {s.text}
              </Card>
            ))}
          </Flex>
        </Tabs.Content>
        <Tabs.Content value="jobs">
          <Button loading={loading} onClick={fetchJobsHN} mt="4">
            Load
          </Button>
          <Flex direction="column" gap="4" mt="4">
            {jobs.map((s) => (
              <Card>
                <Flex gap="2" align="center">
                  {s.title}
                </Flex>
                <Link href={s.url} target="_blank">
                  {s.url}
                </Link>
              </Card>
            ))}
          </Flex>
        </Tabs.Content>
      </Tabs.Root>
    </>
  );
}

export default App;
