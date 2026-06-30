export const getToday = () => {
  return Intl.DateTimeFormat("pt-BR").format(new Date());
};
