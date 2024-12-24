import { AnimatePresence, motion } from "framer-motion"
import { Image as ImageIcon, Loader, SendHorizontal, ThumbsUp } from "lucide-react"
import Image from "next/image"
import { Textarea } from "../ui/textarea"
import { useEffect, useRef, useState } from "react"
import EmojiPicker from "./EmojiPicker"
import { Button } from "../ui/button"
import useSound from "use-sound"
import { usePreferences } from "@/store/usePreferences"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { sendMessageAction } from "@/actions/message.actions"
import { useSelectedUser } from "@/store/useSelectedUser"
import { CldUploadWidget, CloudinaryUploadWidgetInfo } from "next-cloudinary"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog"
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs"
import { pusherClient } from "@/lib/pusher"
import { Message } from "@/db/dummy"

const ChatBottomBar = () => {
    const [message, setMessage] = useState("")
    const textAreaRef = useRef<HTMLTextAreaElement>(null)
    const { selectedUser } = useSelectedUser()
    const { user: currentUser } = useKindeBrowserClient()

    const { soundEnabled } = usePreferences()
    const queryClient = useQueryClient()

    const [imgUrl, setImgUrl] = useState("")

    const [playSound1] = useSound("/sounds/keystroke1.mp3")
    const [playSound2] = useSound("/sounds/keystroke2.mp3")
    const [playSound3] = useSound("/sounds/keystroke3.mp3")
    const [playSound4] = useSound("/sounds/keystroke4.mp3")

    const [playNotificationSound] = useSound("/sounds/notification.mp3")

    const playSoundFunctions = [playSound1, playSound2, playSound3, playSound4]

    const playRandomKeyStrokeSound = () => {
        const randomIndex = Math.floor(Math.random() * playSoundFunctions.length)
        if (soundEnabled) {
            playSoundFunctions[randomIndex]()
        }
    }

    // Mutation to send a message using the sendMessageAction
    // This mutation will be used to send messages to the server
    const { mutate: sendMessage, isPending } = useMutation({
        mutationFn: sendMessageAction,
    })

    const handleSendMessage = () => {
        if (!message.trim()) return

        if (selectedUser?.id) {
            sendMessage({ content: message, messageType: "text", receiverId: selectedUser.id })
        }
        setMessage("")

        textAreaRef.current?.focus()
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault()
            handleSendMessage()
        }

        if (e.key === "Enter" && e.shiftKey) {
            e.preventDefault()
            setMessage(message + "\n")
        }
    }

    useEffect(() => {
        const sortedIds = [currentUser?.id, selectedUser?.id].sort()
        const channelName = sortedIds.join("__")
        const channel = pusherClient?.subscribe(channelName)

        // Handle new incoming messages
        const handleNewMessage = (data: { message: Message }) => {
            // Update the messages in the cache using the query key
            queryClient.setQueryData(["messages", selectedUser?.id], (oldMessages: Message[]) => {
                return [...oldMessages, data.message]
            })

            // Play the notification sound if the sound is enabled and the message is not sent by the current user
            if (soundEnabled && data.message.senderId !== currentUser?.id) {
                playNotificationSound()
            }
        }
        
        // Listen for new messages
        channel.bind("newMessage", handleNewMessage)

        // ! Absolutely important, otherwise the event listener will be added multiple times which means you'll see the incoming new message multiple times
        return () => {
            channel.unbind("newMessage", handleNewMessage)
            pusherClient.unsubscribe(channelName)
        }
    }, [currentUser?.id, selectedUser?.id, queryClient, playNotificationSound, soundEnabled])

    return (
        <div className="p-2 flex justify-between w-full items-center gap-2">
            {!message.trim() && (
                <CldUploadWidget
                    signatureEndpoint={"/api/sign-cloudinary-params"}
                    onSuccess={(result, { widget }) => {
                        setImgUrl((result.info as CloudinaryUploadWidgetInfo).secure_url)
                        widget.close()
                    }}
                >
                    {({ open }) => {
                        return (
                            <ImageIcon
                                size={20}
                                onClick={() => open()}
                                className="cursor-pointer text-muted-foreground"
                            />
                        )
                    }}
                </CldUploadWidget>
            )}

            <Dialog open={!!imgUrl}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Image Preview</DialogTitle>
                    </DialogHeader>
                    <div className="flex justify-center items-center relative h-96 w-full mx-auto">
                        <Image src={imgUrl} alt="Image Preview" fill className="object-contain" />
                    </div>

                    <DialogFooter>
                        <Button
                            type="submit"
                            onClick={() => {
                                if (selectedUser?.id) {
                                    sendMessage({
                                        content: imgUrl,
                                        messageType: "image",
                                        receiverId: selectedUser.id,
                                    })
                                }
                                setImgUrl("")
                            }}
                        >
                            Send
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <AnimatePresence>
                <motion.div
                    key="textarea" // Add unique key
                    layout
                    initial={{ opacity: 0, scale: 1 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1 }}
                    transition={{
                        opacity: { duration: 0.5 },
                        layout: {
                            type: "spring",
                            bounce: 0.15,
                        },
                    }}
                    className="w-full relative"
                >
                    <Textarea
                        autoComplete="off"
                        placeholder="Aa"
                        rows={1}
                        className="w-full border rounded-full flex items-center h-9 resize-none overflow-hidden
						bg-background min-h-0"
                        value={message}
                        onKeyDown={handleKeyDown}
                        onChange={(e) => {
                            setMessage(e.target.value)
                            playRandomKeyStrokeSound()
                        }}
                        ref={textAreaRef}
                    />
                    <div className="absolute right-2 bottom-0.5">
                        <EmojiPicker
                            onChange={(emoji) => {
                                setMessage(message + emoji)
                                if (textAreaRef.current) {
                                    textAreaRef.current.focus()
                                }
                            }}
                        />
                    </div>
                </motion.div>

                {message.trim() ? (
                    <Button
                        key="sendButton" // Add unique key
                        className="h-9 w-9 dark:bg-muted dark:text-muted-foreground dark:hover:bg-muted dark:hover:text-white shrink-0"
                        variant={"ghost"}
                        size={"icon"}
                        onClick={handleSendMessage}
                    >
                        <SendHorizontal size={20} className="text-muted-foreground" />
                    </Button>
                ) : (
                    <Button
                        key="thumbsUpButton" // Add unique key
                        className="h-9 w-9 dark:bg-muted dark:text-muted-foreground dark:hover:bg-muted dark:hover:text-white shrink-0"
                        variant={"ghost"}
                        size={"icon"}
                        onClick={() => {
                            sendMessage({
                                content: "👍",
                                messageType: "text",
                                // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
                                receiverId: selectedUser?.id!,
                            })
                        }}
                    >
                        {!isPending && <ThumbsUp size={20} className="text-muted-foreground" />}
                        {isPending && <Loader size={20} className="animate-spin" />}
                    </Button>
                )}
            </AnimatePresence>
        </div>
    )
}
export default ChatBottomBar
