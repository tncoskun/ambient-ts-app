import {
    Dispatch,
    SetStateAction,
    memo,
    useEffect,
    useRef,
    useState,
} from 'react';
import { AiOutlineCheck } from 'react-icons/ai';
import Jazzicon, { jsNumberForAddress } from 'react-jazzicon';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    DefaultTooltip,
    TextOnlyTooltip,
} from '../../../Global/StyledTooltip/StyledTooltip';
import { Message } from '../../Model/MessageModel';
import { User, getUserLabelForReactions } from '../../Model/UserModel';
import useChatApi from '../../Service/ChatApi';
import PositionBox from '../PositionBox/PositionBox';
import styles from './SentMessagePanel.module.css';

import { IoReturnUpForwardSharp } from 'react-icons/io5';
import { LS_USER_NON_VERIFIED_MESSAGES, getLS } from '../../ChatUtils';
import Menu from '../Options/Menu/Menu';
import Options from '../Options/Options';
import ReplyMessage from '../ReplyMessage/ReplyMessage';

interface SentMessageProps {
    message: Message;
    ensName: string;
    isCurrentUser: boolean;
    currentUser: string | undefined;
    resolvedAddress: string | undefined;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    connectedAccountActive: any;
    isUserLoggedIn: boolean;
    isModerator: boolean;
    room: string;
    isMessageDeleted: boolean;
    setIsMessageDeleted: Dispatch<SetStateAction<boolean>>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    previousMessage: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    nextMessage: any;
    isLinkInCrocodileLabsLinks(word: string): boolean;
    mentionIndex?: number;
    updateLikeDislike: (messageId: string, like: any) => void;
    socketRef: any;
    userMap?: Map<string, User>;
    verifyWallet: (
        verificationType: number,
        verificationDate: Date,
        e?: any,
    ) => void;
    isUserVerified: boolean;
    formatURL(url: string): void;
    isLinkInCrocodileLabsLinksForInput(word: string): boolean;
    showPopUp: boolean;
    setShowPopUp: Dispatch<SetStateAction<boolean>>;
    popUpText: string;
    setPopUpText: Dispatch<SetStateAction<string>>;
    isReplyButtonPressed: boolean;
    setIsReplyButtonPressed: Dispatch<SetStateAction<boolean>>;
    replyMessageContent: Message | undefined;
    setReplyMessageContent: Dispatch<SetStateAction<Message | undefined>>;
    isSubscriptionsEnabled: boolean;
    address: `0x${string}` | undefined;
    isChatOpen: boolean;
    isDeleted: boolean;
    deletedMessageText: string;
    addReactionListener: (message?: Message) => void;
    isDeleteMessageButtonPressed: boolean;
    setIsDeleteMessageButtonPressed: Dispatch<SetStateAction<boolean>>;
    deleteMsgFromList: any;
    addReaction: (messageId: string, userId: string, reaction: string) => void;
    mentionHoverListener: (elementTop: number, walletID: string) => void;
    mentionMouseLeftListener: any;
    handleConfirmationDialog: (
        confirmationType: number,
        startDate: Date,
        endDate?: Date,
    ) => void;
}

function SentMessagePanel(props: SentMessageProps) {
    const { deleteMsgFromList } = props;
    const [isMoreButtonPressed, setIsMoreButtonPressed] = useState(false);
    const [hasSeparator, setHasSeparator] = useState(false);
    const [isClickedOptions, setIsClickedOptions] = useState(false);
    const [isPosition, setIsPosition] = useState(false);
    const [showAvatar, setShowAvatar] = useState<boolean>(true);
    const [showName, setShowName] = useState<boolean>(true);
    const [daySeparator, setdaySeparator] = useState('');
    const [ok, setOk] = useState(false);
    const [flipped, setFlipped] = useState(false);
    const [flipRead, setFlipRead] = useState(false);
    const [count, setCount] = useState(0);
    const [repliedMessageText, setRepliedMessageText] = useState<string>('');
    const [repliedMessageEnsName, setRepliedMessageEnsName] =
        useState<string>('');
    const [repliedMessageDate, setRepliedMessageDate] = useState<string>('');
    const [repliedMessageWalletID, setRepliedMessageWalletID] =
        useState<string>('');

    const likeCount = props.message.likes ? props.message.likes.length : 0;
    const dislikeCount = props.message.dislikes
        ? props.message.dislikes.length
        : 0;

    const { deleteMessage, getRepliedMessageInfo } = useChatApi();

    const navigate = useNavigate();
    const location = useLocation();

    const handleInitialLikeDislike = () => {
        let retVal = 0;
        const liked = props.message.likes?.filter(
            (e) => e === props.currentUser,
        );
        const disliked = props.message.dislikes?.filter(
            (e) => e === props.currentUser,
        );

        if (liked && disliked) {
            retVal = liked?.length > 0 ? 1 : disliked?.length > 0 ? -1 : 0;
        }

        return retVal;
    };

    const messageVoted = handleInitialLikeDislike();

    useEffect(() => {
        const previousMessageDate = new Date(props.previousMessage?.createdAt);
        const currentMessageDate = new Date(props.message?.createdAt);
        const nextMessageDate = new Date(props.nextMessage?.createdAt);
        const currentPreviousDiffInMs = Math.abs(
            currentMessageDate.getTime() - previousMessageDate.getTime(),
        );
        const nextCurrentDiffInMs = Math.abs(
            nextMessageDate.getTime() - currentMessageDate.getTime(),
        );
        getDayAndName(
            props.previousMessage?.createdAt,
            props.message?.createdAt,
        );

        const checkForVerifyDiff = (msg1: Message, msg2: Message) => {
            return (
                msg1.sender === msg2.sender &&
                msg1.isVerified !== msg2.isVerified
            );
        };

        if (props.previousMessage?.sender === props.message?.sender) {
            if (currentPreviousDiffInMs < 1 * 60 * 1000) {
                setShowAvatar(
                    checkForVerifyDiff(props.previousMessage, props.message),
                );
                setShowName(
                    checkForVerifyDiff(props.previousMessage, props.message),
                );
                setOk(
                    !checkForVerifyDiff(props.previousMessage, props.message),
                );
                if (
                    nextCurrentDiffInMs < 1 * 60 * 1000 &&
                    props.nextMessage?.sender === props.message?.sender
                ) {
                    setHasSeparator(
                        checkForVerifyDiff(props.nextMessage, props.message),
                    );
                } else {
                    setHasSeparator(true);
                }
            } else {
                if (
                    nextCurrentDiffInMs < 1 * 60 * 1000 &&
                    props.message?.sender === props.nextMessage?.sender
                ) {
                    setShowAvatar(
                        checkForVerifyDiff(props.nextMessage, props.message),
                    );
                    setShowAvatar(true);
                    setShowName(true);
                    setHasSeparator(
                        checkForVerifyDiff(props.nextMessage, props.message),
                    );
                } else {
                    setShowAvatar(true);
                    setShowName(true);
                    setHasSeparator(true);
                }
            }
        } else {
            setShowAvatar(true);
            setShowName(true);
            if (
                nextCurrentDiffInMs < 1 * 60 * 1000 &&
                props.nextMessage?.sender === props.message?.sender
            ) {
                setHasSeparator(false);
            } else {
                setHasSeparator(true);
            }
        }
    }, [props.message, props.nextMessage, props.previousMessage]);

    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node)
            ) {
                setIsMoreButtonPressed(false);
            }
        };

        document.addEventListener('click', handleClickOutside);

        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, [setIsMoreButtonPressed]);

    useEffect(() => {
        if (
            props.previousMessage &&
            props.message &&
            props.previousMessage.sender === props.message.sender
        ) {
            const previousMessageDate = new Date(
                props.previousMessage.createdAt,
            );
            const currentMessageDate = new Date(props.message.createdAt);
            const currentPreviousDiffInMs = Math.abs(
                currentMessageDate.getTime() - previousMessageDate.getTime(),
            );

            if (currentPreviousDiffInMs < 1 * 60 * 1000) {
                setCount((prevCount) => prevCount + 1);
            } else {
                setCount(0);
            }
        } else {
            setCount(0);
        }
    }, [props.previousMessage, props.message]);

    useEffect(() => {
        if ('repliedMessage' in props.message) {
            getReplyMessageInfo(props.message.repliedMessage as string);
        }
    }, [props.message]);

    const formatAMPM = (str: string) => {
        const date = new Date(str);
        let hours = date.getHours();
        const minutes = date.getMinutes();
        const ampm = hours >= 12 ? 'pm' : 'am';
        hours = hours % 12;
        hours = hours ? hours : 12;
        const _min = minutes.toString().padStart(2, '0');
        const strTime = hours + ':' + _min + ' ' + ampm;
        return strTime;
    };

    const getDayAndName = (previousDay: string, currentDay: string) => {
        const today = new Date();
        const previousMessageDate = new Date(previousDay);
        const currentMessageDate = new Date(currentDay);
        const todayDayNumber = today.getUTCDate();
        const todayMonthNumber = today.toLocaleString('default', {
            month: 'long',
        });
        const previousDayNumber = previousMessageDate.getUTCDate();
        const currentDayNumber = currentMessageDate.getUTCDate();
        const currentDayMonthNumber = currentMessageDate.toLocaleString(
            'default',
            {
                month: 'long',
            },
        );
        if (
            todayDayNumber === currentDayNumber &&
            todayMonthNumber === currentDayMonthNumber &&
            previousDayNumber !== currentDayNumber
        ) {
            setdaySeparator('Today');
        } else {
            if (previousDayNumber !== currentDayNumber) {
                setdaySeparator(currentDayNumber + ' ' + currentDayMonthNumber);
            } else {
                setdaySeparator('');
            }
        }
    };

    function hasEns() {
        return !(
            props.message.ensName === '' ||
            props.message.ensName === 'defaultValue' ||
            props.message.ensName === null ||
            props.message.ensName === 'null' ||
            props.message.ensName === undefined ||
            props.message.ensName === 'undefined'
        );
    }

    function getShownName() {
        if (!hasEns()) {
            return props.message.walletID.slice(0, 6) + '...';
        } else {
            return props.message.ensName;
        }
    }

    function handleOpenExplorer(url: string) {
        window.open(url);
    }

    function handleOpenExplorerAddHttp(url: string) {
        window.open(convertToFullUrl(url));
    }

    function convertToFullUrl(domain: string): string {
        const protocol = 'https://';
        return protocol + domain;
    }

    function returnDomain(word: string) {
        if (props.isLinkInCrocodileLabsLinks(word)) {
            const url = new URL(word);
            return url.hostname + url.pathname;
        } else {
            return word;
        }
    }

    function detectLinksFromMessage(url: string) {
        if (url.includes(' ')) {
            const words: string[] = url.split(' ');
            return (
                <>
                    {words.map((word, index) => (
                        <span
                            onClick={() =>
                                props.isLinkInCrocodileLabsLinks(word)
                                    ? handleOpenExplorer(word)
                                    : props.isLinkInCrocodileLabsLinksForInput(
                                          word,
                                      )
                                    ? handleOpenExplorerAddHttp(word)
                                    : ''
                            }
                            key={index}
                            style={
                                props.isLinkInCrocodileLabsLinks(word) ||
                                props.isLinkInCrocodileLabsLinksForInput(word)
                                    ? {
                                          color: '#ab7de7',
                                          cursor: 'pointer',
                                      }
                                    : props.message.isDeleted
                                    ? { color: 'red', cursor: 'default' }
                                    : { color: 'white', cursor: 'default' }
                            }
                        >
                            {' ' + returnDomain(word)}
                            {}
                        </span>
                    ))}
                </>
            );
        } else {
            if (
                props.isLinkInCrocodileLabsLinks(url) ||
                props.isLinkInCrocodileLabsLinksForInput(url)
            ) {
                return (
                    <p
                        style={{ color: '#ab7de7', cursor: 'pointer' }}
                        onClick={() =>
                            props.isLinkInCrocodileLabsLinks(url)
                                ? handleOpenExplorer(url)
                                : props.isLinkInCrocodileLabsLinksForInput(url)
                                ? handleOpenExplorerAddHttp(url)
                                : ''
                        }
                    >
                        {returnDomain(url)}
                    </p>
                );
            } else {
                return url;
            }
        }
    }

    function mentionedMessage() {
        const messagesArray = props.message.message.split(' ');
        if (showAvatar === true) {
            if (props.message.isMentionMessage === true) {
                return (
                    <div className={` ${styles.mention_message_block}`}>
                        {messagesArray.map((word, index) => (
                            <span
                                key={index}
                                className={` ${styles.mention_message}`}
                                style={{
                                    color:
                                        word.slice(1) === props.ensName ||
                                        word.slice(1) ===
                                            props.connectedAccountActive
                                            ? '#7371FC'
                                            : 'white',
                                }}
                            >
                                {' ' + detectLinksFromMessage(word)}
                            </span>
                        ))}
                        <div className={styles.roomInfo_with_mention}>
                            {' '}
                            {props.room === 'Admins'
                                ? props.message.roomInfo
                                : ''}
                        </div>
                    </div>
                );
            } else {
                return (
                    <div
                        className={
                            props.message.isDeleted
                                ? styles.deletedMessage
                                : styles.message
                        }
                    >
                        {detectLinksFromMessage(props.message.message)}
                        <div className={styles.roomInfo}>
                            {' '}
                            {props.room === 'Admins'
                                ? props.message.roomInfo
                                : ''}{' '}
                        </div>
                    </div>
                );
            }
        } else {
            if (props.message.isMentionMessage === true) {
                return (
                    <div
                        className={` ${styles.mention_message_block_without_avatar}`}
                    >
                        {messagesArray.map((word, index) => (
                            <span
                                key={index}
                                className={` ${styles.mention_message}`}
                                style={{
                                    color:
                                        word.slice(1) === props.ensName ||
                                        word.slice(1) ===
                                            props.connectedAccountActive
                                            ? '#7371FC'
                                            : 'white',
                                }}
                            >
                                {' ' + detectLinksFromMessage(word)}
                            </span>
                        ))}
                        <div className={styles.roomInfo}>
                            {' '}
                            {props.room === 'Admins'
                                ? props.message.roomInfo
                                : ''}
                        </div>
                    </div>
                );
            } else {
                return (
                    <div
                        className={
                            props.message.isDeleted
                                ? styles.deletedMessage_without_avatar
                                : styles.message_without_avatar
                        }
                    >
                        {detectLinksFromMessage(props.message.message)}
                        <div className={styles.roomInfo}>
                            {props.room === 'Admins'
                                ? props.message.roomInfo
                                : ''}
                        </div>
                    </div>
                );
            }
        }
    }

    function buildMessageToken(word: string, mentFound: any) {
        let ret = <></>;
        if (
            props.isLinkInCrocodileLabsLinks(word) ||
            props.isLinkInCrocodileLabsLinksForInput(word)
        ) {
            ret = (
                <span
                    className={styles.link_token}
                    onClick={() => {
                        handleOpenExplorerAddHttp(word);
                    }}
                >
                    {word}
                </span>
            );
        } else {
            if (
                mentFound.val == false &&
                word.indexOf('@') >= 0 &&
                props.message.mentionedWalletID
            ) {
                mentFound.val = true;
                ret = (
                    <span
                        onMouseEnter={(e) => {
                            props.mentionHoverListener(
                                e.currentTarget.getBoundingClientRect().top,
                                props.message.mentionedWalletID,
                            );
                        }}
                        onMouseLeave={props.mentionMouseLeftListener}
                        className={styles.mentioned_name_token}
                    >
                        {word}
                    </span>
                );
            } else {
                ret = <span> {word} </span>;
            }
        }
        return ret;
    }

    function renderMessage() {
        const messagesArray = props.message.message.split(' ');
        const mentFound = { val: false };

        return (
            <div
                className={` ${styles.message_block_wrapper}
                                ${
                                    showAvatar == true
                                        ? ' '
                                        : styles.without_avatar
                                }
        `}
            >
                <div
                    className={
                        styles.message_block +
                        ' ' +
                        (props.message.isVerified == true
                            ? styles.vrf_msg_dbg
                            : '')
                    }
                >
                    {messagesArray.map((e, i) => {
                        return (
                            <span key={i} className={styles.message_token}>
                                {buildMessageToken(e, mentFound)}
                            </span>
                        );
                    })}
                </div>
                <div className={styles.roomInfo}>
                    {' '}
                    {props.room === 'Admins' ? props.message.roomInfo : ''}
                </div>
            </div>
        );
    }

    const jazziconsSeed = props.message.walletID.toLowerCase();

    const myJazzicon = (
        <Jazzicon diameter={25} seed={jsNumberForAddress(jazziconsSeed)} />
    );

    const repliedJazzicon =
        'repliedMessage' in props.message ? (
            <Jazzicon
                svgStyles={{ marginBottom: '8px' }}
                diameter={10}
                seed={jsNumberForAddress(repliedMessageWalletID.toLowerCase())}
            />
        ) : undefined;

    // function blockUser(userId: string) {

    // }
    function getReplyMessageInfo(_id: string) {
        getRepliedMessageInfo(_id).then((result: any) => {
            setRepliedMessageText(result[0].message);
            setRepliedMessageDate(formatAMPM(result[0].createdAt));
            setRepliedMessageEnsName(result[0].ensName);
            setRepliedMessageWalletID(result[0].walletID);
        });
        return repliedMessageText;
    }
    function clickOptionButton() {
        setIsClickedOptions(!isClickedOptions);
    }

    function handleLikeAndDislikeLS(messageId: string, val: number) {
        const currObj = localStorage.getItem('lkds');
        let newObj = {};
        if (currObj != null && currObj != undefined) {
            newObj = { ...JSON.parse(currObj), [messageId]: val };
        } else {
            newObj = { [messageId]: val };
        }
        localStorage.setItem('lkds', JSON.stringify(newObj));

        const payloadObj = {
            userId: props.currentUser,
            actionType: val,
        };

        props.updateLikeDislike(props.message._id, payloadObj);
    }

    function messageStyle() {
        if (ok) {
            if (!hasSeparator) {
                return { width: '90%', marginBottom: -15 };
            } else {
                return { width: '90%', marginBottom: 0 };
            }
        } else {
            return { width: '90%', marginBottom: -7 };
        }
    }

    function getReactionUsers(reaction: string) {
        const ret = [''];
        if (props.message.reactions != undefined) {
            props.message.reactions[reaction].map((user: string) => {
                const userObj = props.userMap?.get(user);
                if (userObj) {
                    ret.push(getUserLabelForReactions(userObj));
                }
            });
        }

        ret.splice(0, 1);
        if (ret.length > 5) {
            const moreCount = ret.length - 5;
            ret.splice(5, ret.length - 5);
            ret.push('...');
            ret.push(moreCount.toString() + ' more');
        }
        return ret;
    }

    function processReactions() {
        const emojiCounts = Object.keys(props.message.reactions).map(
            (emoji) => ({
                emoji,
                count: props.message.reactions[emoji].length,
            }),
        );

        emojiCounts.sort((a, b) => b.count - a.count);

        const ret = [''];

        emojiCounts.map((e) => {
            ret.push(e.emoji);
        });
        return ret.slice(1, 4);
    }

    function isUserIncluded(reaction: string) {
        let ret = false;
        if (props.message.reactions != undefined) {
            props.message.reactions[reaction].map((user: string) => {
                if (user === props.currentUser) {
                    ret = true;
                }
            });
        }
        return ret;
    }

    const optionsButtonRef = useRef<any>();

    function shouldOptionsRiseToBottom() {
        const wrapper = document.getElementById('chatmessage');
        if (wrapper && optionsButtonRef.current) {
            const tresholdPoint =
                wrapper.getBoundingClientRect().height / 4 +
                wrapper.getBoundingClientRect().top;
            return (
                tresholdPoint >
                optionsButtonRef.current.getBoundingClientRect().top
            );
        }
        return false;
    }

    function checkLocalStorage(messageId: string) {
        const nonVrfMessages = getLS(
            LS_USER_NON_VERIFIED_MESSAGES,
            props.address,
        );
        if (nonVrfMessages) {
            const messageIDs = nonVrfMessages.split(',');
            const parsedMessages: string[] = [];
            messageIDs.map((e) => {
                parsedMessages.push(e.trim());
            });

            if (parsedMessages.includes(messageId)) {
                return true;
            } else {
                return false;
            }
        }
    }

    return (
        <div
            className={`${styles.msg_bubble_container} ${
                props.mentionIndex !== undefined
                    ? 'mentionedMessage mentIndex-' + props.mentionIndex
                    : ''
            }  ${flipped ? styles.flipped : ''}  ${
                flipRead ? styles.flip_read : ''
            } 
            ${
                'repliedMessage' in props.message
                    ? styles.replied_message_container
                    : ' '
            }

            ${hasSeparator ? styles.has_separator : ''}
            ${
                props.message.mentionedWalletID === props.address
                    ? styles.reader_mentioned
                    : ''
            }

            ${
                shouldOptionsRiseToBottom() && isMoreButtonPressed
                    ? styles.rise_to_bottom_wrapper
                    : ''
            }
            ${daySeparator !== '' ? styles.has_day_separator : ''} 
            ${showAvatar ? styles.thread_top_msg : ''} 

            ${props.message.isDeleted ? styles.deleted_msg : ''}

            ${props.room == 'Admins' ? styles.admin_room_msg : ''}
            `}
            // style={messageStyle()}
            data-ment-index={props.mentionIndex}
            onMouseLeave={() => {
                setIsMoreButtonPressed(false);
            }}
        >
            {!props.message.isDeleted || props.isModerator ? (
                <div className={styles.msg_bubble_content}>
                    <div className={styles.msg_bubble_front}>
                        {/* <div
                            className={styles.flip_trigger}
                            onClick={() => {
                                setFlipped(true);
                            }}
                        ></div> */}
                        {props.address &&
                            (props.isCurrentUser || props.isModerator) && // TODO WBO : this control will be removed when other features enabled
                            props.isUserVerified &&
                            !props.message.isDeleted && (
                                <div
                                    ref={optionsButtonRef}
                                    className={styles.options_button}
                                >
                                    <Options
                                        setIsReplyButtonPressed={
                                            props.setIsReplyButtonPressed
                                        }
                                        message={props.message}
                                        isReplyButtonPressed={
                                            props.isReplyButtonPressed
                                        }
                                        replyMessageContent={
                                            props.replyMessageContent
                                        }
                                        setReplyMessageContent={
                                            props.setReplyMessageContent
                                        }
                                        isMoreButtonPressed={
                                            isMoreButtonPressed
                                        }
                                        setIsMoreButtonPressed={
                                            setIsMoreButtonPressed
                                        }
                                        addReactionListener={
                                            props.addReactionListener
                                        }
                                        tooltipTop={shouldOptionsRiseToBottom()}
                                        isModerator={props.isModerator}
                                        isUsersMessage={
                                            props.message.sender ===
                                            props.currentUser
                                        }
                                        isUserVerified={props.isUserVerified}
                                    />
                                </div>
                            )}

                        <div>
                            {daySeparator === '' ? (
                                ''
                            ) : daySeparator !== '' ? (
                                <p className={styles.separator}>
                                    {daySeparator}
                                </p>
                            ) : (
                                ''
                            )}
                            {'repliedMessage' in props.message &&
                                (showAvatar ? (
                                    <IoReturnUpForwardSharp
                                        style={{
                                            position: 'absolute',
                                            top: '-0.3rem',
                                            left: '0.6rem',
                                        }}
                                    />
                                ) : (
                                    <IoReturnUpForwardSharp
                                        style={{
                                            position: 'absolute',
                                            top: '-0.3rem',
                                            left: '0.6rem',
                                            transform: 'scaleY(-1)',
                                        }}
                                    />
                                ))}

                            {'repliedMessage' in props.message ? (
                                <div className={styles.replied_box}>
                                    <ReplyMessage
                                        message={repliedMessageText}
                                        time={repliedMessageDate}
                                        setIsReplyButtonPressed={
                                            props.setIsReplyButtonPressed
                                        }
                                        isReplyButtonPressed={false}
                                        myJazzicon={repliedJazzicon}
                                        repliedMessageEnsName={
                                            props.replyMessageContent?.ensName
                                        }
                                        ensName={
                                            props.replyMessageContent?.ensName
                                        }
                                        walletID={
                                            props.replyMessageContent?.walletID
                                        }
                                    />
                                </div>
                            ) : (
                                ''
                            )}
                            <div
                                className={
                                    props.isUserLoggedIn
                                        ? props.message.isMentionMessage ===
                                          false
                                            ? styles.sent_message_body
                                            : props.message.mentionedName?.trim() ===
                                                  props.ensName?.trim() ||
                                              props.message.mentionedName?.trim() ===
                                                  props.connectedAccountActive?.trim()
                                            ? styles.sent_message_body_with_mention
                                            : styles.sent_message_body
                                        : styles.sent_message_body
                                }
                            >
                                {showAvatar && (
                                    <div className={styles.avatar_jazzicons}>
                                        {myJazzicon}
                                    </div>
                                )}
                                {!showAvatar && (
                                    <div
                                        style={{
                                            display: 'none',
                                            marginLeft: '10px',
                                        }}
                                    >
                                        <div className={styles.nft_container}>
                                            {myJazzicon}
                                        </div>
                                    </div>
                                )}
                                <div className={styles.message_item}>
                                    <div
                                        className={
                                            showName && props.isCurrentUser
                                                ? styles.current_user_name +
                                                  ' ' +
                                                  styles.name_default
                                                : showName &&
                                                  !props.isCurrentUser
                                                ? styles.name +
                                                  ' ' +
                                                  styles.name_default
                                                : !showName &&
                                                  !props.isCurrentUser
                                                ? ''
                                                : ''
                                        }
                                    >
                                        <span
                                            className={
                                                styles.name_default_label
                                            }
                                            onClick={() => {
                                                if (
                                                    location.pathname !==
                                                    `/${
                                                        props.message
                                                            .ensName ===
                                                        'defaultValue'
                                                            ? props.message
                                                                  .walletID
                                                            : props.message
                                                                  .ensName
                                                    }`
                                                ) {
                                                    navigate(
                                                        `/${
                                                            props.isCurrentUser
                                                                ? 'account'
                                                                : !hasEns()
                                                                ? props.message
                                                                      .walletID
                                                                : props.message
                                                                      .ensName
                                                        }`,
                                                    );
                                                }
                                            }}
                                        >
                                            {showName && getShownName()}
                                        </span>
                                        {showAvatar &&
                                            props.message.isVerified && (
                                                <div
                                                    className={
                                                        styles.verified_icon
                                                    }
                                                >
                                                    <AiOutlineCheck
                                                        color='var(--other-green)'
                                                        size={10}
                                                    />
                                                </div>
                                            )}
                                        {showAvatar &&
                                            !props.message.isVerified &&
                                            props.isCurrentUser && (
                                                <>
                                                    <DefaultTooltip
                                                        interactive
                                                        title={
                                                            props.isUserVerified
                                                                ? 'Update verification date'
                                                                : 'Verify wallet since this message'
                                                        }
                                                        placement={'left'}
                                                        arrow
                                                        enterDelay={400}
                                                        leaveDelay={200}
                                                    >
                                                        <div
                                                            className={
                                                                styles.update_verify_date_icon
                                                            }
                                                            onClick={() => {
                                                                props.handleConfirmationDialog(
                                                                    checkLocalStorage(
                                                                        props
                                                                            .message
                                                                            ._id,
                                                                    )
                                                                        ? 1
                                                                        : 2,
                                                                    new Date(
                                                                        props.message.createdAt,
                                                                    ),
                                                                );
                                                            }}
                                                        >
                                                            <AiOutlineCheck
                                                                color='var(--other-red)'
                                                                size={10}
                                                            />
                                                        </div>
                                                    </DefaultTooltip>
                                                </>
                                            )}
                                    </div>

                                    <PositionBox
                                        message={props.message.message}
                                        isInput={false}
                                        isPosition={isPosition}
                                        setIsPosition={setIsPosition}
                                        walletExplorer={getShownName()}
                                        isCurrentUser={props.isCurrentUser}
                                        showAvatar={showAvatar}
                                    />
                                    {!isPosition && renderMessage()}
                                    {isMoreButtonPressed ? (
                                        <Menu
                                            isMessageDeleted={
                                                props.isMessageDeleted
                                            }
                                            setIsMessageDeleted={
                                                props.setIsMessageDeleted
                                            }
                                            setIsMoreButtonPressed={
                                                setIsMoreButtonPressed
                                            }
                                            setFlipped={(val) => {
                                                setFlipped(true);
                                                setFlipRead(true);
                                            }}
                                            deleteMsgFromList={
                                                deleteMsgFromList
                                            }
                                            id={props.message._id}
                                            isModerator={props.isModerator}
                                            isUsersMessage={
                                                props.message.sender ===
                                                props.currentUser
                                            }
                                            setIsReplyButtonPressed={
                                                props.setIsReplyButtonPressed
                                            }
                                            isReplyButtonPressed={false}
                                            replyMessageContent={
                                                props.replyMessageContent
                                            }
                                            setReplyMessageContent={
                                                props.setReplyMessageContent
                                            }
                                            message={props.message}
                                            addReactionListener={
                                                props.addReactionListener
                                            }
                                            isUserVerified={
                                                props.isUserVerified
                                            }
                                            riseToBottom={shouldOptionsRiseToBottom()}
                                        />
                                    ) : (
                                        <></>
                                    )}
                                </div>

                                <div className={styles.reply_message}>
                                    <p className={styles.message_date}>
                                        {formatAMPM(props.message.createdAt)}
                                    </p>

                                    <div></div>
                                </div>

                                {/* {snackbarContent} */}
                            </div>

                            {props.message.reactions &&
                                Object.keys(props.message.reactions).length >
                                    0 && (
                                    <div className={styles.reactions_wrapper}>
                                        {
                                            // Object.keys(
                                            //     props.message.reactions,
                                            // )
                                            processReactions().map(
                                                (reaction, index) => {
                                                    return (
                                                        <TextOnlyTooltip
                                                            key={reaction}
                                                            title={
                                                                <div
                                                                    className={
                                                                        styles.reaction_users_tooltip
                                                                    }
                                                                >
                                                                    {getReactionUsers(
                                                                        reaction,
                                                                    ).map(
                                                                        (e) => {
                                                                            return (
                                                                                <div
                                                                                    key={
                                                                                        e
                                                                                    }
                                                                                >
                                                                                    {
                                                                                        e
                                                                                    }
                                                                                </div>
                                                                            );
                                                                        },
                                                                    )}
                                                                </div>
                                                            }
                                                        >
                                                            <div
                                                                key={
                                                                    props
                                                                        .message
                                                                        ._id +
                                                                    reaction
                                                                }
                                                                className={`
                                                            ${
                                                                styles.reaction_node
                                                            } 
                                                            ${
                                                                isUserIncluded(
                                                                    reaction,
                                                                )
                                                                    ? styles.user_reacted
                                                                    : ''
                                                            } 
                                                        `}
                                                                onClick={() => {
                                                                    if (
                                                                        props.currentUser !=
                                                                        undefined
                                                                    )
                                                                        props.addReaction(
                                                                            props
                                                                                .message
                                                                                ._id,
                                                                            props.currentUser,
                                                                            reaction,
                                                                        );
                                                                }}
                                                            >
                                                                {reaction}
                                                            </div>
                                                        </TextOnlyTooltip>
                                                    );
                                                },
                                            )
                                        }
                                    </div>
                                )}

                            {hasSeparator ? (
                                <hr
                                    className={styles.separator}
                                    style={{ cursor: 'default' }}
                                />
                            ) : (
                                <></>
                            )}
                        </div>
                    </div>

                    <div className={styles.msg_bubble_back}>
                        <div
                            className={styles.flip_trigger}
                            onClick={() => {
                                setFlipped(false);
                                setFlipRead(false);
                            }}
                        ></div>
                        <div
                            className={styles.flip_trigger_lefted}
                            onMouseEnter={() => {
                                setFlipRead(true);
                            }}
                            onMouseLeave={() => {
                                // setFlipRead(false);
                            }}
                        >
                            💬
                        </div>
                        {/* <div className={styles.like_btn_base}> + </div>
                    <div className={styles.like_btn_base}> - </div> */}

                        <div className={styles.msg_bubble_back_content}>
                            <div
                                className={`${
                                    messageVoted == 1 ? styles.active : ''
                                } ${styles.like_btn_base} 
                            ${!props.isUserVerified ? styles.disabled : ''}
                            `}
                                onClick={() => {
                                    if (props.isUserVerified) {
                                        handleLikeAndDislikeLS(
                                            props.message._id,
                                            1,
                                        );
                                    }
                                }}
                            >
                                {' '}
                                👍{' '}
                            </div>

                            <div
                                className={`${
                                    messageVoted == -1 ? styles.active : ''
                                } ${styles.like_btn_base} ${styles.dislike_btn}
                            ${!props.isUserVerified ? styles.disabled : ''}
                            `}
                                onClick={() => {
                                    if (props.isUserVerified) {
                                        handleLikeAndDislikeLS(
                                            props.message._id,
                                            -1,
                                        );
                                    }
                                }}
                            >
                                {' '}
                                👎{' '}
                            </div>

                            {likeCount + dislikeCount > 0 && (
                                <>
                                    <div
                                        className={
                                            styles.like_dislike_bar_wrapper
                                        }
                                    >
                                        <div
                                            className={
                                                styles.like_dislike_node_wrapper
                                            }
                                            style={{
                                                width:
                                                    (likeCount /
                                                        (dislikeCount +
                                                            likeCount)) *
                                                        100 +
                                                    '%',
                                            }}
                                        >
                                            <div
                                                className={
                                                    styles.like_dislike_node
                                                }
                                            ></div>
                                        </div>
                                        <div
                                            className={
                                                styles.like_dislike_node_wrapper
                                            }
                                            style={{
                                                width:
                                                    (dislikeCount /
                                                        (dislikeCount +
                                                            likeCount)) *
                                                        100 +
                                                    '%',
                                            }}
                                        >
                                            <div
                                                className={`${styles.like_dislike_node} ${styles.dislike_node}`}
                                            ></div>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            ) : (
                <></>
            )}
        </div>
    );
}

export default memo(SentMessagePanel);
