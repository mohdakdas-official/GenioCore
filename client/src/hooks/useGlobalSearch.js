import { useEffect, useMemo, useState } from "react";

import { searchPlatform } from "../services/search.service";

const NAVIGATION_ITEMS = [
  {
    id: "dashboard",
    label: "Dashboard",
    description: "Platform overview and recent metrics",
    path: "/v1/dashboard",
    keywords: "dashboard home overview scores metrics",
  },
  {
    id: "projects",
    label: "Projects",
    description: "View and manage projects",
    path: "/v1/projects",
    keywords: "project projects repository code",
  },
  {
    id: "reviews",
    label: "Reviews",
    description: "Code reviews and reports",
    path: "/v1/reviews",
    keywords: "review reviews report reports analysis",
  },
  {
    id: "analytics",
    label: "Analytics",
    description: "Scores, severity and review trends",
    path: "/v1/analytics",
    keywords: "analytics score scores trends severity metrics",
  },
  {
    id: "activity",
    label: "Activity",
    description: "Recent project and review activity",
    path: "/v1/activity",
    keywords: "activity recent history events",
  },
  {
    id: "notifications",
    label: "Notifications",
    description: "Review and security notifications",
    path: "/v1/notifications",
    keywords: "notification notifications alerts bell",
  },
  {
    id: "settings",
    label: "Settings",
    description: "Profile, security and appearance",
    path: "/v1/settings",
    keywords: "settings profile username password security appearance theme",
  },
  {
    id: "help",
    label: "Help & Documentation",
    description: "Guides, FAQs and troubleshooting",
    path: "/v1/help",
    keywords: "help docs documentation faq troubleshooting",
  },
];

const ACTIONS = [
  {
    id: "start-review",
    label: "Start Review",
    description: "Create a new code review",
    path: "/v1/reviews?start=1",
    keywords: "start review new review create review scan code",
  },
];

const getErrorMessage = (error) =>
  error?.response?.data?.message || error?.message || "Unable to search.";

const matchesQuery = (item, query) => {
  const searchable = [item.label, item.description, item.keywords]
    .join(" ")
    .toLowerCase();

  return searchable.includes(query.toLowerCase());
};

export const useGlobalSearch = (query, delay = 400) => {
  const [projects, setProjects] = useState([]);

  const [reviews, setReviews] = useState([]);

  const [issues, setIssues] = useState([]);

  const [notifications, setNotifications] = useState([]);

  const [isSearching, setIsSearching] = useState(false);

  const [error, setError] = useState("");

  const normalizedQuery = query.trim();

  const navigation = useMemo(() => {
    if (normalizedQuery.length < 2) {
      return [];
    }

    return NAVIGATION_ITEMS.filter((item) =>
      matchesQuery(item, normalizedQuery),
    );
  }, [normalizedQuery]);

  const actions = useMemo(() => {
    if (normalizedQuery.length < 2) {
      return [];
    }

    return ACTIONS.filter((item) => matchesQuery(item, normalizedQuery));
  }, [normalizedQuery]);

  useEffect(() => {
    if (normalizedQuery.length < 2) {
      setProjects([]);
      setReviews([]);
      setIssues([]);
      setNotifications([]);
      setError("");
      setIsSearching(false);

      return;
    }

    let cancelled = false;

    setIsSearching(true);
    setError("");

    const timeoutId = setTimeout(async () => {
      try {
        const response = await searchPlatform(normalizedQuery);

        if (cancelled) {
          return;
        }

        const data = response?.data;

        setProjects(data?.projects ?? []);

        setReviews(data?.reviews ?? []);

        setIssues(data?.issues ?? []);

        setNotifications(data?.notifications ?? []);
      } catch (error) {
        if (cancelled) {
          return;
        }

        setProjects([]);
        setReviews([]);
        setIssues([]);
        setNotifications([]);

        setError(getErrorMessage(error));
      } finally {
        if (!cancelled) {
          setIsSearching(false);
        }
      }
    }, delay);

    return () => {
      cancelled = true;

      clearTimeout(timeoutId);
    };
  }, [normalizedQuery, delay]);

  const hasResults =
    projects.length > 0 ||
    reviews.length > 0 ||
    issues.length > 0 ||
    notifications.length > 0 ||
    navigation.length > 0 ||
    actions.length > 0;

  return {
    projects,
    reviews,
    issues,
    notifications,
    navigation,
    actions,

    isSearching,
    error,
    hasResults,
  };
};
