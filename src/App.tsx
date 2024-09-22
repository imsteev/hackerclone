import {
  Text,
  Button,
  Card,
  Flex,
  Heading,
  Separator,
  Tabs,
  Link,
  Container,
  Badge,
  Dialog,
} from "@radix-ui/themes";
import { useEffect, useMemo, useRef, useState } from "react";
import { HN, Paginator, Story, type Item } from "./clients/hackernews";
import { SizeIcon } from "@radix-ui/react-icons";

function App() {
  const [loading, setLoading] = useState(false);

  const [top, setTop] = useState<Item[]>([]);
  const [jobs, setJobs] = useState<Item[]>([]);
  const [best, setBest] = useState<Item[]>([]);
  const [show, setShow] = useState<Item[]>([]);
  const [newStories, setNewStories] = useState<Item[]>([]);
  const [ask, setAsk] = useState<Item[]>([]);

  const paginatorTop = useRef(new Paginator(10));
  const paginatorJobs = useRef(new Paginator(10));
  const paginatorBest = useRef(new Paginator(10));
  const paginatorShow = useRef(new Paginator(10));
  const paginatorNew = useRef(new Paginator(10));
  const paginatorAsk = useRef(new Paginator(10));

  // Load all IDs first (HN API doesn't support pagination natively, so we frontload a batch of IDs first)
  useEffect(() => {
    HN._getLiveDataIDs("top").then((ids) => {
      paginatorTop.current.withIDs(ids);
    });
    HN._getLiveDataIDs("job").then((ids) => {
      paginatorJobs.current.withIDs(ids);
    });
    HN._getLiveDataIDs("best").then((ids) => {
      paginatorBest.current.withIDs(ids);
    });
    HN._getLiveDataIDs("show").then((ids) => {
      paginatorShow.current.withIDs(ids);
    });
    HN._getLiveDataIDs("new").then((ids) => {
      paginatorNew.current.withIDs(ids);
    });
    HN._getLiveDataIDs("ask").then((ids) => {
      paginatorAsk.current.withIDs(ids);
    });
  }, []);

  // Order matters for tab display-purposes
  const tabs = useMemo(
    () => [
      {
        name: "top",
        label: "Top Stories",
        stories: top,
        setStories: setTop,
        paginator: paginatorTop,
      },
      {
        name: "job",
        label: "Jobs",
        stories: jobs,
        setStories: setJobs,
        paginator: paginatorJobs,
      },
      {
        name: "new",
        label: "New",
        stories: newStories,
        setStories: setNewStories,
        paginator: paginatorNew,
      },
      {
        name: "best",
        label: "Best",
        stories: best,
        setStories: setBest,
        paginator: paginatorBest,
      },
      {
        name: "show",
        label: "Show HN",
        stories: show,
        setStories: setShow,
        comments: true,
        paginator: paginatorShow,
      },
      {
        name: "ask",
        label: "Ask HN",
        stories: ask,
        setStories: setAsk,
        comments: true,
        paginator: paginatorAsk,
      },
    ],
    [top, jobs, newStories, best, show, ask]
  );
  return (
    <Container p="6">
      <Heading size="9">HackerClone</Heading>
      <Tabs.Root>
        <Tabs.List>
          {tabs.map((t) => (
            <Tabs.Trigger
              key={t.name}
              value={t.name}
              onClick={() =>
                t.paginator.current.load().then((items) => t.setStories(items))
              }
            >
              {t.label}
            </Tabs.Trigger>
          ))}
        </Tabs.List>
        {tabs.map((t) => (
          <Tabs.Content value={t.name} key={t.name}>
            <HNStories
              stories={t.stories}
              onNext={() =>
                t.paginator.current.next().then((items) => t.setStories(items))
              }
              onPrevious={() =>
                t.paginator.current
                  .previous()
                  .then((items) => t.setStories(items))
              }
              showComments={!!t.comments}
            />
          </Tabs.Content>
        ))}
      </Tabs.Root>
    </Container>
  );
}

const HNStories = ({
  onNext,
  onPrevious,
  loading = false,
  stories,
  showComments = false,
}) => {
  return (
    <>
      <Flex justify="between">
        <Button
          loading={loading}
          onClick={onPrevious}
          mt="4"
          size="1"
          variant="outline"
        >
          Previous
        </Button>
        <Button
          loading={loading}
          onClick={onNext}
          mt="4"
          size="1"
          variant="outline"
        >
          Next
        </Button>
      </Flex>

      <Flex direction="column" gap="4" mt="4">
        {stories.map((s) => (
          <Card key={s.id}>
            <Flex gap="2" align="center">
              <a href={s.url} target="_blank">
                {s.title}
              </a>{" "}
              <Dialog.Root>
                <Dialog.Trigger>
                  <Button size="1" disabled={!s.text}>
                    <SizeIcon />
                  </Button>
                </Dialog.Trigger>
                <Dialog.Content>
                  <Dialog.Title>
                    <Link href={s.url} target="_blank">
                      {s.title}
                    </Link>
                  </Dialog.Title>
                  <Dialog.Description>
                    <div dangerouslySetInnerHTML={{ __html: s.text }} />
                  </Dialog.Description>
                  <Flex>
                    <Badge variant="surface" color="yellow">
                      {s.by}
                    </Badge>
                  </Flex>
                </Dialog.Content>
              </Dialog.Root>
              {!!showComments && (
                <>
                  <Separator orientation="vertical" />{" "}
                  <Text style={{ color: "var(--gray-10)" }}>
                    <Link
                      href={`https://news.ycombinator.com/item?id=${s.id}`}
                      target="_blank"
                    >
                      {s.kids?.length || 0} comments
                    </Link>
                  </Text>
                </>
              )}
            </Flex>
          </Card>
        ))}
      </Flex>
    </>
  );
};

export default App;
