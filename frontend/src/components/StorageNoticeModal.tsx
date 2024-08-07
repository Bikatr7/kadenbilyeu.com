// Copyright 2024 Kaden Bilyeu (Bikatr7) (https://github.com/Bikatr7) (https://github.com/Bikatr7/kadenbilyeu.com) (https://kadenbilyeu.com)
// Use of this source code is governed by an GNU Affero General Public License v3.0
// license that can be found in the LICENSE file.

// maintain allman bracket style for consistency

// react
import React, { useState, useEffect } from 'react';

// chakra-ui
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Text
} from "@chakra-ui/react";

const StorageNoticeModal: React.FC = () => 
{
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [hasSeenNotice, setHasSeenNotice] = useState(false);

    useEffect(() => 
    {
        const noticeStatus = localStorage.getItem('hasSeenStorageNotice');
        if (!noticeStatus) 
        {
            onOpen();
        } 
        else 
        {
            setHasSeenNotice(true);
        }
    }, [onOpen]);

    const handleClose = () => 
    {
        localStorage.setItem('hasSeenStorageNotice', 'true');
        setHasSeenNotice(true);
        onClose();
    };

    if (hasSeenNotice) return null;

    return (
        <Modal isOpen={isOpen} onClose={handleClose} isCentered>
            <ModalOverlay />
            <ModalContent bg="black" borderColor="darkgrey" borderWidth={2}>
                <ModalHeader color="yellow">Website Storage Notice</ModalHeader>
                <ModalCloseButton color="white" />
                <ModalBody>
                    <Text color="white">
                        This website uses browser storage for essential functionality. <br /><br />
                        No personal data is collected or shared. No cookies are used.  <br /><br />
                        By using this website, you agree to the use of browser storage. No action is required from you.
                    </Text>
                </ModalBody>
                <ModalFooter>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default StorageNoticeModal;