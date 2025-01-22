import { Box, Text, VStack, Progress, Heading } from "@chakra-ui/react";
import { useEffect, useState } from "react";

interface RepoActivity {
    name: string;
    commits: number;
    percentage: number;
}

function GitHubActivity() {
    const [repoActivities, setRepoActivities] = useState<RepoActivity[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchGitHubActivity = async () => {
            try {
                const response = await fetch('https://api.github.com/users/Bikatr7/events');
                const events = await response.json();
                
                const sevenDaysAgo = new Date();
                sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
                
                const pushEvents = events.filter((event: any) => 
                    event.type === 'PushEvent' && 
                    new Date(event.created_at) > sevenDaysAgo
                );

                const repoCommits: { [key: string]: number } = {};
                let totalCommits = 0;

                pushEvents.forEach((event: any) => {
                    const repoName = event.repo.name.split('/')[1];
                    repoCommits[repoName] = (repoCommits[repoName] || 0) + event.payload.size;
                    totalCommits += event.payload.size;
                });

                const activities = Object.entries(repoCommits)
                    .map(([name, commits]) => ({
                        name,
                        commits,
                        percentage: Math.round((commits / totalCommits) * 100)
                    }))
                    .sort((a, b) => b.commits - a.commits)
                    .slice(0, 3);

                setRepoActivities(activities);
                setIsLoading(false);
            } catch (error) {
                console.error('Error fetching GitHub activity:', error);
                setIsLoading(false);
            }
        };

        fetchGitHubActivity();
    }, []);

    if (isLoading) {
        return (
            <Box p={4}>
                <Text color="purple.400" fontFamily="'Press Start 2P', monospace">Loading...</Text>
            </Box>
        );
    }

    return (
        <VStack 
            spacing={2}
            align="stretch" 
            p={3}
            border="2px solid"
            borderColor="purple.400"
            bg="black"
            width="450px"
            mt={2}
        >
            <Heading 
                size="xs"
                color="purple.400" 
                fontFamily="'Press Start 2P', monospace"
                mb={1}
            >
                Past 7 Days
            </Heading>
            {repoActivities.map((repo) => (
                <Box key={repo.name} mb={1}>
                    <Text 
                        color="purple.400" 
                        fontFamily="'Press Start 2P', monospace"
                        fontSize="xs"
                        mb={1}
                    >
                        {repo.name} ({repo.commits} commits)
                    </Text>
                    <Progress 
                        value={repo.percentage} 
                        size="xs"
                        colorScheme="purple"
                        bg="purple.900"
                        borderRadius="none"
                    />
                </Box>
            ))}
        </VStack>
    );
}

export default GitHubActivity; 