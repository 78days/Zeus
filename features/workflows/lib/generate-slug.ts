import {
  adjectives,
  animals,
  uniqueNamesGenerator,
} from "unique-names-generator";

export const generateSlug = () =>
  uniqueNamesGenerator({
    dictionaries: [adjectives, animals],
    separator: "-",
    style: "lowerCase",
  });
