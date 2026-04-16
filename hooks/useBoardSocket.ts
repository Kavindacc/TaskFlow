'use client';

import { useEffect, useRef } from 'react';
import { getSocket } from '@/lib/socket';
import { Board, Card, List } from '@/types/board';

interface UseBoardSocketOptions {
  boardId: string;
  board: Board | null;
  setBoard: React.Dispatch<React.SetStateAction<Board | null>>;
  selectedCard: Card | null;
  setSelectedCard: React.Dispatch<React.SetStateAction<Card | null>>;
}

export function useBoardSocket({
  boardId,
  board,
  setBoard,
  selectedCard,
  setSelectedCard,
}: UseBoardSocketOptions) {
  // Use a ref so event handlers always have the latest board value
  const boardRef = useRef<Board | null>(board);
  useEffect(() => { boardRef.current = board; }, [board]);

  useEffect(() => {
    if (!boardId) return;

    const socket = getSocket();

    // Join this board's room
    socket.emit('join:board', boardId);
    console.log(`🔌 Joined board room: board:${boardId}`);

    // ── Card events ────────────────────────────────────────────────────────
    const onCardCreated = ({ card, listId }: { card: Card; listId: string }) => {
      setBoard((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          lists: prev.lists?.map((list) =>
            list.id === listId
              ? { ...list, cards: [...list.cards, card] }
              : list
          ),
        };
      });
    };

    const onCardUpdated = ({ card }: { card: Card }) => {
      setBoard((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          lists: prev.lists?.map((list) => ({
            ...list,
            cards: list.cards.map((c) => (c.id === card.id ? { ...c, ...card } : c)),
          })),
        };
      });
      // If the updated card is currently open in the detail modal, update it
      if (selectedCard?.id === card.id) {
        setSelectedCard((prev) => (prev ? { ...prev, ...card } : prev));
      }
    };

    const onCardDeleted = ({ cardId, listId }: { cardId: string; listId: string }) => {
      setBoard((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          lists: prev.lists?.map((list) =>
            list.id === listId
              ? { ...list, cards: list.cards.filter((c) => c.id !== cardId) }
              : list
          ),
        };
      });
      // Close modal if the deleted card is open
      if (selectedCard?.id === cardId) setSelectedCard(null);
    };

    const onCardMoved = ({
      card,
      sourceListId,
      destListId,
    }: {
      card: Card;
      sourceListId: string;
      destListId: string;
      order: number;
    }) => {
      setBoard((prev) => {
        if (!prev) return prev;

        const newLists = prev.lists?.map((list) => {
          // Same-list reorder — handle in one pass to avoid remove-without-reinsert
          if (sourceListId === destListId && list.id === sourceListId) {
            const cards = list.cards.filter((c) => c.id !== card.id);
            cards.splice(card.order, 0, card);
            return { ...list, cards };
          }

          // Cross-list move — remove from source
          if (list.id === sourceListId) {
            return { ...list, cards: list.cards.filter((c) => c.id !== card.id) };
          }

          // Cross-list move — insert into destination
          if (list.id === destListId) {
            const cards = list.cards.filter((c) => c.id !== card.id);
            cards.splice(card.order, 0, card);
            return { ...list, cards };
          }

          return list;
        });

        return { ...prev, lists: newLists };
      });
    };

    // ── List events ────────────────────────────────────────────────────────
    const onListCreated = ({ list }: { list: List }) => {
      setBoard((prev) => {
        if (!prev) return prev;
        // Avoid duplicate if current user already added it optimistically
        const exists = prev.lists?.some((l) => l.id === list.id);
        if (exists) return prev;
        return { ...prev, lists: [...(prev.lists ?? []), list] };
      });
    };

    const onListUpdated = ({ list }: { list: List }) => {
      setBoard((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          lists: prev.lists?.map((l) => (l.id === list.id ? { ...l, ...list } : l)),
        };
      });
    };

    const onListDeleted = ({ listId }: { listId: string }) => {
      setBoard((prev) => {
        if (!prev) return prev;
        return { ...prev, lists: prev.lists?.filter((l) => l.id !== listId) };
      });
    };

    const onListReordered = ({ lists }: { lists: { id: string; order: number }[] }) => {
      setBoard((prev) => {
        if (!prev) return prev;
        const orderMap = new Map(lists.map((l) => [l.id, l.order]));
        const reordered = [...(prev.lists ?? [])].sort(
          (a, b) => (orderMap.get(a.id) ?? a.order) - (orderMap.get(b.id) ?? b.order)
        );
        return { ...prev, lists: reordered };
      });
    };

    // Register all listeners
    socket.on('card:created', onCardCreated);
    socket.on('card:updated', onCardUpdated);
    socket.on('card:deleted', onCardDeleted);
    socket.on('card:moved', onCardMoved);
    socket.on('list:created', onListCreated);
    socket.on('list:updated', onListUpdated);
    socket.on('list:deleted', onListDeleted);
    socket.on('list:reordered', onListReordered);

    return () => {
      // Leave room and clean up listeners on unmount
      socket.emit('leave:board', boardId);
      socket.off('card:created', onCardCreated);
      socket.off('card:updated', onCardUpdated);
      socket.off('card:deleted', onCardDeleted);
      socket.off('card:moved', onCardMoved);
      socket.off('list:created', onListCreated);
      socket.off('list:updated', onListUpdated);
      socket.off('list:deleted', onListDeleted);
      socket.off('list:reordered', onListReordered);
    };
  }, [boardId]); // Only re-run when boardId changes
}
