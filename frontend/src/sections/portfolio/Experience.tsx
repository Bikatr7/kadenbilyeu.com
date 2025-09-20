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
                    title="Full Stack Engineer at Network Goods Institute"
                    dateRange="November 2024 - Present"
                    description={[
                        "Well, to start. I could yap on and on about this one, as as of February of that year I had taken on full ownership of the project. But I'll *try* to keep it short.",
                        "I've been working with Network Goods Institute for sometime on several different things, for this stint I've been mainly working on a little thing called Negation Game.",
                        "It's goal and purpose has changed and progressed a lot since it's inception, but I would best describe it now (September 2025) as a DAO/Governance tool discussion platform that incorporates some cool ideas to enable better reasoning, debate, and discourse.",
                        "We're perpetually working on a lot to try and envision something greater for it, and while it the next few months it could very well become something greater.",
                        "When I first started working on it back in November of 2024, I had spent my time working on something called epistemic leverage. To properly describe that I would need a whitepaper, so in short, the version I implemented was a prototype method to hold people economically accountable for their opinions and encourage people to self-invalidate and encourage people to seek the objective truth.",
                        "It was based on four core decisions. Stake, Restake, Self-Slash, and Doubt. All technically doable by one person but the idea was a community would take these actions on one another and their opinions.",
                        "Negation Game ended up heading in a different direction after implementing this, but epistemic leverage itself is still something we are looking to incorporate into what we hoping to develop, something called carroll mechanisms. I lack the time to explain this in depth, but here: https://paragraph.com/@ngi/carroll-mechanisms",
                        "Since then, my main focus has been on something we initially called viewpoints, then called rationales, and are now trying to see if we want to call something else haha. When you try to innovate and create something truly amazing, what you view changes a lot as you begin to develop and iterate upon it.",
                        "Rationales are definitely a good example of that, in short it's a way to represent the viewpoint of a person or group of people on a topic. But not just one perspective that would show only the positive or negative aspects of something. The idea is you get to see the entire context of a topic, but with how that specific person views it.",
                        "This has evolved over time that initially focused on a single person's perspective, but we're currently exploring true 'multiplayer' approaches that would facilitate more complex and nuanced conversations.",
                        "As of right now I'm currently iterating and experimenting with the best UI/UX for such a thing, as well as working on the backend to support it.",
                        "With how things are progressing internally though, it's possible the nature of my work will greatly shift here soon."
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
                        "The above is my copy paste resume line since I cannot say much.",
                        "I had a lot of fun here, I had the chance to work with OSCorp at the SDA TAP LAB in Colorado Springs. I got to work with some really cool people, and learn a lot about AI/ML and space defense.",
                        "Some of the connections made here have helped my career greatly, and I'm eternally grateful for the opportunity.",
                        "It also reaffirmed that I wanted to eventually work in the defense industry, and that I would like to work in the space domain. I was planning to do so actually, but I ended up going into different directions.",
                        "At the turn of the new year I had several offers from different defense contractors but I ended up not going with any of them, I had chosen to hopefully pursue a position in the civil service working for the US Space Force, but with the new administration things got complicated and my offer got rescinded.",
                        "Unfortunately for me, this was learned by me after I had closed all other offers and at around November after my internship ended with OSCorp I had no employment prospects. This was not great. However it let to me rejoining NGi where I worked on a new project I'll expand on above."
                    ]}
                    tags={["Python", "AI/ML", "Space Defense", "Algorithm Development", "Data Analysis", "TensorFlow", "PyTorch", "C++", "Machine Learning", "Keras", "Scikit-Learn"]}
                    useBulletPoints={true}
                />
                <Item
                    title="Software Engineering Intern at Network Goods Institute"
                    dateRange="July 2024 - September 2024"
                    description={[
                        "I was lucky enough to be given the opportunity to work with them. It's funny cause I was just shitposting on twitter at like less than a hundred followers, and then I randomly got a dm from a UCCS alum.",
                        "I spent most of my time here working on a visualization tool for an index wallet powered economy simulation. It's really interesting stuff, and while I must admit that most of it went over my head at first, I've come to realize that it's not as complicated as it seems.",
                        "To be a bit honest, I wasn't too familiar with visualization in Python. My prior experience was solely with Gradio, which is what I initially suggested using.",
                        "It however proved to be too limited for what we needed, so I learned how to use Plotly and Dash. I knew basically nothing about either, but I was able to pick it up quickly.",
                        "Thankfully, I was able to pick up the skills quickly, and I've been doing that along with editing the simulation itself which is mostly just a lot of math.",
                        "I was able to brush up on my NumPy and Pandas skills as well, which was nice.",
                        "I learned a lot about the basics of Data Science, and how to apply it to real world problems, at least in a professional setting. There is only so much you can learn from a textbook or teach yourself in a classroom setting.",
                        "Anyway, we ended up learning what we wanted, the economic model was not invalidated which was what we were hoping for and it has turned out to be a core research idea for NGi since."
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
                        "It involves a lot of writing and analyzing LLM outputs, which is something I would do already even without this gig work.",
                        "This was pretty broad, anywhere from like general knowledge that anyone not completely illiterate would be able to do, to advanced coding problems that would stump most people.",
                        "It didn't pay well and I ended up getting a proper job later on which caused me to drop this. I might go back for some additional revenue later but Outlier has kinda fizzled out and doesn't really seem to be offering any gigs anymore."
                    ]}
                    tags={["Python", "LLM", "RLHF", "Reinforcement Learning", "Fine-Tuning", "Evaluation"]}
                    useBulletPoints={false}
                />
                <Item
                    title="Teacher's Assistant at University of Colorado Colorado Springs (UCCS)"
                    dateRange="January 2024 - May 2025"
                    description={[
                        "I was a TA for a Data Analysis and Statistics course taught in R by Doc Hanratty.",
                        "It was an interesting experience, most of my time was spent grading and answering direct questions from students.",
                        "I did some direct meetings with students to help them with their assignments when needed.",
                        "I recently was hired to be a TA again as these are seasonal roles, this time for a Programming in C with Agile course.",
                        "It's mostly been more of the same, grading and helping students with their assignments when needed. But I've been a bit more hands on with the students here.",
                        "Just recently for the Spring of 2025 I was hired to be a TA again for Doc, for the same course. I was looking and hoping to get two more positions for the fall of 2025, alas the UCCS CS Department funding got cut, and they basically stopped hiring TAs.",
                        "Instead they just repurposed a bunch of PHD/Graduate students to TA the courses so I was out of a job lol."
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
                        "In which case, it would be January 2023 when I started work on Kudasai. I could go on and on about Kudasai, and trust me I will later in the projects section. But for now, let's just say it's when I started coding for others.",
                        "I've done a lot of work since then, some unpaid, some paid. Sadly most of all that paid work has been closed source, so I can't really show it off despite how much I'd like to.",
                        "But I've learned a lot, and I still consider myself a Freelance Developer to this day, as I still do gigs here and there and contribute to open source projects (mostly my own)."

                    ]}
                    useBulletPoints={false}
                />
            </Card>
        </Box>
    );
}

export default Experience;
