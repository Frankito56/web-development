import { IOpenLibraryFetcher } from '../../application/use-cases/BookUseCases';

interface OpenLibraryWorkResponse {
  title?: string;
  description?: string | { value?: string };
  covers?: number[];
  subjects?: string[];
  authors?: Array<{ author?: { key?: string } }>;
  first_publish_date?: string;
}

interface OpenLibraryAuthorResponse {
  name?: string;
}

export class OpenLibraryClient implements IOpenLibraryFetcher {
  private readonly baseUrl = 'https://openlibrary.org';

  async fetchBookByWorkKey(workKey: string): Promise<{
    title: string;
    authors: string[];
    publishYear?: number;
    coverUrl?: string;
    description?: string;
    subjects: string[];
    isbn?: string;
  } | null> {
    try {
      const cleanKey = workKey.startsWith('/works/') ? workKey : `/works/${workKey}`;
      const url = `${this.baseUrl}${cleanKey}.json`;

      const res = await fetch(url);
      if (!res.ok) return null;

      const data = (await res.json()) as OpenLibraryWorkResponse;

      let description: string | undefined;
      if (typeof data.description === 'string') {
        description = data.description;
      } else if (data.description && typeof data.description === 'object') {
        description = data.description.value;
      }

      let coverUrl: string | undefined;
      if (data.covers && data.covers.length > 0) {
        const coverId = data.covers[0];
        coverUrl = `https://covers.openlibrary.org/b/id/${coverId}-L.jpg`;
      }

      let publishYear: number | undefined;
      if (data.first_publish_date) {
        const match = data.first_publish_date.match(/\d{4}/);
        if (match) publishYear = parseInt(match[0], 10);
      }

      const authors: string[] = [];
      if (data.authors && data.authors.length > 0) {
        for (const authorRef of data.authors.slice(0, 3)) {
          const authorKey = authorRef.author?.key;
          if (authorKey) {
            try {
              const authorRes = await fetch(`${this.baseUrl}${authorKey}.json`);
              if (authorRes.ok) {
                const authorData = (await authorRes.json()) as OpenLibraryAuthorResponse;
                if (authorData.name) authors.push(authorData.name);
              }
            } catch {
              continue;
            }
          }
        }
      }

      return {
        title: data.title || 'Unknown Title',
        authors: authors.length > 0 ? authors : ['Unknown Author'],
        publishYear,
        coverUrl,
        description,
        subjects: (data.subjects || []).slice(0, 5),
      };
    } catch {
      return null;
    }
  }
}
