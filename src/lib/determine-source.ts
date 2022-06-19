/**
 * Find whether the article comes from snopes or politifact
 */

export const isPolitifact = (file: string) => {
  return file.search('<meta property="og:url" content="https://www.politifact.com') > -1
}
