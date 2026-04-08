// TypeScript types for TaskFlow boards, lists, and cards

export interface User {
  id: string;
  email: string;
  name: string | null;
}

export interface BoardMember {
  id: string;
  role: string;
  user: User;
}

export interface Board {
  id: string;
  title: string;
  ownerId: string;
  createdAt: string;
  owner: User;
  members: BoardMember[];
  _count?: {
    lists: number;
    members: number;
  };
  lists?: List[];
}

export interface List {
  id: string;
  title: string;
  order: number;
  boardId: string;
  cards: Card[];
}

export interface Comment {
  id: string;
  text: string;
  createdAt: string;
  author: {
    id: string;
    name: string | null;
    email: string;
  };
}

export interface Card {
  id: string;
  title: string;
  description: string | null;
  order: number;
  listId: string;
  labels: string[];
  dueDate: string | null;
  comments?: Comment[];
}

// API Response types
export interface CreateBoardResponse {
  message: string;
  board: Board;
}

export interface UpdateBoardResponse {
  message: string;
  board: Board;
}

export interface DeleteBoardResponse {
  message: string;
  deletedBoard: {
    id: string;
    title: string;
  };
}
