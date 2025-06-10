// Set a variable that contains all the fields needed for slides when a fetch for
// content is performed
const SLIDE_GRAPHQL_FIELDS = `
  sys {
    id
  }
  heroData [{
    id
    title
    description
    titleEmail
    ctaLabel
    ctaLink
  }]
`;

async function fetchGraphQL(query, preview = false) {
    return fetch(
        `https://graphql.contentful.com/content/v1/spaces/${process.env.CONTENTFUL_SPACE_ID}`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                // Switch the Bearer token depending on whether the fetch is supposed to retrieve live
                // Contentful content or draft content
                Authorization: `Bearer ${
                    preview
                        ? process.env.CONTENTFUL_PREVIEW_ACCESS_TOKEN
                        : process.env.CONTENTFUL_ACCESS_TOKEN
                }`,
            },
            body: JSON.stringify({ query }),
            // Associate all fetches for slides with an "slides" cache tag so content can
            // be revalidated or updated from Contentful on publish
            next: { tags: ["slides"] },
        }
    ).then((response) => response.json());
}

function extractSlideEntries(fetchResponse) {
    return fetchResponse?.data?.heroBannerCollection?.items;
}

export async function getAllSlide(
    // For this demo set the default limit to always return 3 slides.
    limit = 3,
    // By default this function will return published content but will provide an option to
    // return draft content for reviewing slides before they are live
    isDraftMode = false
) {
    const slides = await fetchGraphQL(
        `query {
        heroBannerCollection(where:{slug_exists: true}, order: date_DESC, limit: ${limit}, preview: ${
            isDraftMode ? "true" : "false"
        }) {
          items {
            ${SLIDE_GRAPHQL_FIELDS}
          }
        }
      }`,
        isDraftMode
    );
    return extractSlideEntries(slides);
}

export async function getSlide(
    slug,
    isDraftMode = false
) {
    const slide = await fetchGraphQL(
        `query {
        heroBannerCollection(where:{slug: "${slug}"}, limit: 1, preview: ${
            isDraftMode ? "true" : "false"
        }) {
          items {
            ${SLIDE_GRAPHQL_FIELDS}
          }
        }
      }`,
        isDraftMode
    );
    return extractSlideEntries(slide)[0];
}
