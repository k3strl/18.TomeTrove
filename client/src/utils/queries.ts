import { gql } from '@apollo/client';

export const QUERY_ME = gql`
  query Me {
    Me {
      _id
      username
      email
      bookCount
      savedBooks {
        bookId
        authors
        description
        title
        image
        link
      }
    }
  }
`;