import { pusherServer } from './pusher';

export async function triggerBoardUpdate(boardId: string, data: any) {
  await pusherServer.trigger(`board-${boardId}`, 'board-update', data);
}

export async function triggerCardUpdate(boardId: string, cardId: string, data: any) {
  await pusherServer.trigger(`board-${boardId}`, 'card-update', {
    cardId,
    ...data,
  });
}

export async function triggerListUpdate(boardId: string, listId: string, data: any) {
  await pusherServer.trigger(`board-${boardId}`, 'list-update', {
    listId,
    ...data,
  });
}

export async function triggerCommentAdded(boardId: string, cardId: string, data: any) {
  await pusherServer.trigger(`board-${boardId}`, 'comment-added', {
    cardId,
    ...data,
  });
}