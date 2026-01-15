export const useISTDate = () => {
  const formatDateTime = (dateString) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const toDateInputValue = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toISOString().slice(0, 10);
  };

  const todayIST = () => new Date().toISOString().slice(0, 10);

  return { formatDateTime, formatDate, toDateInputValue, todayIST };
};