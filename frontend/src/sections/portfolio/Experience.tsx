// Copyright 2024 Kaden Bilyeu (Bikatr7) (https://github.com/Bikatr7) (https://github.com/Bikatr7/kadenbilyeu.com) (https://kadenbilyeu.com)
// Use of this source code is governed by an GNU Affero General Public License v3.0
// license that can be found in the LICENSE file.

// maintain allman bracket style for consistency

// chakra-ui
import { Box } from "@chakra-ui/react";

// components
import { Card, Item } from "../../components/Card";

function Experience() {
    return (
        <Box>
            <Card title="Experience">
                <Item
                    title="Software Engineering Intern at Network Goods Institute"
                    dateRange="July 2024 - Present"
                    description={[
                        "I was lucky enough to be given the opportunity to work with them.",
                        "I've spent most of my time here working on a visualization tool for an index wallet powered economy simulation. It's really interesting stuff, and while I must admit that most of it went over my head at first, I've come to realize that it's not as complicated as it seems.",
                        "To be a bit honest, I wasn't too familiar with visualization in Python. My prior experience was solely with Gradio.",
                        "It however proved to be too limited for what we needed, so I learned how to use Plotly and Dash. I knew basically nothing about either, but I was able to pick it up quickly.",
                        "Thankfully, I was able to pick up the skills quickly, and I've been doing that along with editing the simulation itself which is mostly just a lot of math.",
                        "I was able to brush up on my NumPy and Pandas skills as well, which was nice."
                    ]}
                    useBulletPoints={false}
                />
                <Item
                    title="'AI Trainer' at Outlier AI"
                    dateRange="June 2024 - Present"
                    description={[
                        "I don't really have an official title, but in the middle of the summer I took some gig work for Outlier AI as it was more in line with my career goals than food service.",
                        "I can't say too much about exactly what I do, but it's mostly just using RLHF (Reinforcement Learning from Human Feedback) to train, fine-tune, and evaluate language models.",
                        "It involves a lot of writing and analyzing LLM outputs, which is something I would do already even without this gig work."
                    ]}
                    useBulletPoints={false}
                />
                <Item
                    title="Teacher's Assistant at University of Colorado Colorado Springs (UCCS)"
                    dateRange="January 2024 - Present"
                    description={[
                        "I was a TA for a Data Analysis and Statistics course taught in R by Doc Hanratty.",
                        "It was an interesting experience, most of my time was spent grading and answering direct questions from students.",
                        "I did some direct meetings with students to help them with their assignments when needed.",
                        "I recently was hired to be a TA again as these are seasonal roles, this time for a Programming in C with Agile course.",
                        "I haven't started yet, but I'm looking forward to it. Hopefully I'll be able to learn a lot from it and help students learn as well."
                    ]}
                    useBulletPoints={false}
                />
            </Card>
        </Box>
    );
}

export default Experience;
