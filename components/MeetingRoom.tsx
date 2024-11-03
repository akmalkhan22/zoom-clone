'use client';
import { useState } from 'react';
import {
  CallControls,
  CallParticipantsList,
  CallStatsButton,
  CallingState,
  PaginatedGridLayout,
  SpeakerLayout,
  useCallStateHooks,
} from '@stream-io/video-react-sdk';
import { useRouter, useSearchParams, useParams } from 'next/navigation';
import { Users, LayoutList, Download, Link } from 'lucide-react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import Loader from './Loader';
import EndCallButton from './EndCallButton';
import { cn } from '@/lib/utils';

type CallLayoutType = 'grid' | 'speaker-left' | 'speaker-right';

const MeetingRoom = () => {
  const searchParams = useSearchParams();
  const { id } = useParams();
  const isPersonalRoom = !!searchParams.get('personal');
  const router = useRouter();
  const [linkCopied, setLinkCopied] = useState(false);
  const [layout, setLayout] = useState<CallLayoutType>('speaker-left');
  const [showParticipants, setShowParticipants] = useState(false);
  const { useCallCallingState } = useCallStateHooks();

  // Define the invitation link using the `call.id`
  const invitationLink = `${window.location.origin}/meeting/${id}`;

  // Copy invitation link function
  const copyToClipboard = () => {
    navigator.clipboard.writeText(invitationLink);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000); // Hide message after 2 seconds
  };
 
  // Mock participants list including the host with a proper name
  const participants = [
    {
      "name": "Daniyal", // Ensure the host's actual name is here
      "email": "daniyal@gmail.com"
    },
    {
      "name": "Ahmed Khan",
      "email": "ahmed.khan@example.com"
    },
    {
      "name": "Bilal Shah",
      "email": "bilal.shah@example.com"
    },
    {
      "name": "Faizan Ali",
      "email": "faizan.ali@example.com"
    },
    {
      "name": "Hamza Sheikh",
      "email": "hamza.sheikh@example.com"
    },
    {
      "name": "Usman Tariq",
      "email": "usman.tariq@example.com"
    }
  ];

  // Function to download the participant list
  const downloadParticipantList = () => {
    const participantListText = participants
      .map(participant => `Name: ${participant.name}, Email: ${participant.email}`)
      .join('\n');
    const blob = new Blob([participantListText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'participants_list.txt';
    link.click();
    URL.revokeObjectURL(url);
  };

  // Calling state check
  const callingState = useCallCallingState();
  if (callingState !== CallingState.JOINED) return <Loader />;

  const CallLayout = () => {
    switch (layout) {
      case 'grid':
        return <PaginatedGridLayout />;
      case 'speaker-right':
        return <SpeakerLayout participantsBarPosition="left" />;
      default:
        return <SpeakerLayout participantsBarPosition="right" />;
    }
  };

  return (
    <section className="relative h-screen w-full overflow-hidden pt-4 text-white">
      <div className="relative flex size-full items-center justify-center">
        <div className="flex size-full max-w-[1000px] items-center">
          <CallLayout />
        </div>
        {showParticipants && (
          <div className={cn('h-[calc(100vh-86px)] ml-2 p-4 bg-gray-800 rounded-md')}>
            <button
              onClick={() => setShowParticipants(false)}
              className="mb-2 text-white bg-red-600 px-2 py-1 rounded"
            >
              Close
            </button>
            <h2 className="text-lg font-bold text-white mb-4">Participants</h2>
            <ul>
              {participants.map((participant, index) => (
                <li key={index} className="text-white mb-2">
                  <strong>{participant.name}</strong> - {participant.email}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Video layout and call controls */}
      <div className="fixed bottom-0 flex w-full items-center justify-center gap-5">
        <CallControls onLeave={() => router.push(`/`)} />

        <DropdownMenu>
          <div className="flex items-center">
            <DropdownMenuTrigger className="cursor-pointer rounded-2xl bg-[#19232d] px-4 py-2 hover:bg-[#4c535b]">
              <LayoutList size={20} className="text-white" />
            </DropdownMenuTrigger>
          </div>
          <DropdownMenuContent className="border-dark-1 bg-dark-1 text-white">
            {['Grid', 'Speaker-Left', 'Speaker-Right'].map((item, index) => (
              <div key={index}>
                <DropdownMenuItem
                  onClick={() =>
                    setLayout(item.toLowerCase() as CallLayoutType)
                  }
                >
                  {item}
                </DropdownMenuItem>
                <DropdownMenuSeparator className="border-dark-1" />
              </div>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Copy Link Button */}
        <button onClick={copyToClipboard} className="cursor-pointer rounded-2xl bg-[#19232d] px-4 py-2 hover:bg-[#4c535b] flex items-center gap-2">
          <Link size={20} className="text-white" />
          {linkCopied ? 'Link copied!' : 'Copy Link'}
        </button>

        {/* Download Participant List Button */}
        <button onClick={downloadParticipantList} className="cursor-pointer rounded-2xl bg-[#19232d] px-4 py-2 hover:bg-[#4c535b] flex items-center gap-2">
          <Download size={20} className="text-white" />
          Download Participants
        </button>

        <CallStatsButton />

        {/* Toggle participant list */}
        <button onClick={() => setShowParticipants(prev => !prev)}>
          <div className="cursor-pointer rounded-2xl bg-[#19232d] px-4 py-2 hover:bg-[#4c535b]">
            <Users size={20} className="text-white" />
          </div>
        </button>

        {!isPersonalRoom && <EndCallButton />}
      </div>
    </section>
  );
};

export default MeetingRoom;
