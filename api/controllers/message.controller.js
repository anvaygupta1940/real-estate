import prisma from "../lib/prisma.js";

export const addMessage = async (req, res) => {
  const tokenUserId = req.userId;
  const chatId = req.params.chatId;
  const text = req.body.text;

  try {
    const chat = await prisma.Chat.findUnique({
      where: {
        id: chatId,
        userIDs: {
          hasSome: [tokenUserId],
        },
      },
    });

    if (!chat) return res.status(404).json({ message: "Chat not found!" });

    const message = await prisma.Message.create({
      data: {
        text,
        chatId,
        userId: tokenUserId,
      },
    });

    await prisma.Chat.update({
      where: {
        id: chatId,
      },
      data: {
        seenBy: [tokenUserId],
        lastMessage: text,
      },
    });

    return res.status(200).json(message);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Failed to add message!" });
  }
};
