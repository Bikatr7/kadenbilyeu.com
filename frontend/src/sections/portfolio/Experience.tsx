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
                    title="Junior Full Stack Engineer at Network Goods Institute"
                    dateRange="November 2024 - Present"
                    description={[
                        "Well, to start. I could yap on and on about this one. But I'll *try* to keep it short.",
                        "I've been working with Network Goods Institute for sometime, for this stint I've been mainly working on a little thing called Negation Game.",
                        "As I mentioned earlier, I'm not sure how much I can say about it without getting into too much detail, but I will say that it's a really interesting project.",
                        "It's taught me a lot, things move very quickly in the startup world and I've basically taken over developer ownership of the project."
                    ]}
                    useBulletPoints={false}
                />
                <Item
                    title="AI/ML Intern at OSCorp"
                    dateRange="September 2024 - November 2024"
                    description={[
                        "Designed new AI/ML systems for space defense using Python, C++, TensorFlow, and PyTorch, focusing on enhancing autonomy and real-time decision-making capabilities",
                        "Analyzed extensive space data to create new algorithms while leveraging machine learning techniques and data analysis tools",
                        "Enhanced U.S. space domain awareness efforts by improving sensor search and reacquisition capabilities",
                        "----------------------------------------------",
                        "I had a lot of fun here, I had the chance to work with OSCorp as the SDA TAP LAB in Colorado Springs. I got to work with some really cool people, and learn a lot about AI/ML and space defense.",
                        "I'm not sure how much I can say without getting into too much detail, but I will say that it reaffirmed that I wanted to eventually work in the defense industry."
                    ]}
                    tags={["Python", "AI/ML", "Space Defense", "Algorithm Development", "Data Analysis", "TensorFlow", "PyTorch", "C++", "Machine Learning", "Keras", "Scikit-Learn"]}
                    useBulletPoints={true}
                />
                <Item
                    title="Software Engineering Intern at Network Goods Institute"
                    dateRange="July 2024 - September 2024"
                    description={[
                        "I was lucky enough to be given the opportunity to work with them.",
                        "I've spent most of my time here working on a visualization tool for an index wallet powered economy simulation. It's really interesting stuff, and while I must admit that most of it went over my head at first, I've come to realize that it's not as complicated as it seems.",
                        "To be a bit honest, I wasn't too familiar with visualization in Python. My prior experience was solely with Gradio.",
                        "It however proved to be too limited for what we needed, so I learned how to use Plotly and Dash. I knew basically nothing about either, but I was able to pick it up quickly.",
                        "Thankfully, I was able to pick up the skills quickly, and I've been doing that along with editing the simulation itself which is mostly just a lot of math.",
                        "I was able to brush up on my NumPy and Pandas skills as well, which was nice.",
                        "I learned a lot about the basics of Data Science, and how to apply it to real world problems."
                    ]}
                    tags={["Python", "Dash", "Plotly", "NumPy", "Pandas", "Scikit-Learn", "Data Science"]}
                    useBulletPoints={false}
                />
                <Item
                    title="'AI Trainer' at Outlier AI"
                    dateRange="June 2024 - September 2024"
                    description={[
                        "I don't really have an official title, but in the middle of the summer I took some gig work for Outlier AI as it was more in line with my career goals than food service.",
                        "I can't say too much about exactly what I do, but it's mostly just using RLHF (Reinforcement Learning from Human Feedback) to train, fine-tune, and evaluate language models.",
                        "It involves a lot of writing and analyzing LLM outputs, which is something I would do already even without this gig work."
                    ]}
                    tags={["Python", "LLM", "RLHF", "Reinforcement Learning", "Fine-Tuning", "Evaluation"]}
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
                        "It's mostly been more of the same, grading and helping students with their assignments when needed. But I've been a bit more hands on with the students here."
                    ]}
                    tags={["C", "Agile", "R", "RStudio", "Statistics", "Data Analysis"]}
                    useBulletPoints={false}
                />
                <Item
                    title="Freelance Developer"
                    dateRange="January 2023 - Present"
                    description={[
                        "This is tricky, the date range would depend on what you would consider a 'Freelance Developer'.",
                        "Personally, I define as when I started coding for people other than myself.",
                        "In which case, it would be January 2023 when I started work on Kudasai. I could go on and on about Kudasai, and trust me I will later. But for now, let's just say it's when I started coding for others.",
                        "I've done a lot of work since then, some unpaid, some paid. Sadly most of all that paid work has been closed source, so I can't really show it off.",
                        "But I've learned a lot, and I still consider myself a Freelance Developer to this day, as I still do gigs here and there and contribute to open source projects (mostly my own)."

                    ]}
                    useBulletPoints={false}
                />
            </Card>
        </Box>
    );
}

export default Experience;
