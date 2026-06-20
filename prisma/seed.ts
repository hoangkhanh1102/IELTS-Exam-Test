import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const db = new PrismaClient({ adapter })

async function main() {
  const test = await db.test.create({
    data: {
      title: 'Practice Test 1',
      type: 'FULL',
      description: 'A sample IELTS Reading test with 3 passages and 40 questions.',
      timeLimit: 60,
      passages: {
        create: [
          {
            order: 1,
            title: 'The History of Coffee',
            topic: 'History / Food & Drink',
            body: `Coffee, the world's most popular beverage after water, has a history stretching back centuries. Legend traces its discovery to a goat herder in ancient Ethiopia named Kaldi, who noticed his goats became unusually energetic after consuming berries from a particular tree. He brought the berries to a local monastery, where monks made a drink from them and found it kept them alert during evening prayers.

The cultivation and trading of coffee began on the Arabian Peninsula. By the 15th century, coffee was being grown in the Yemeni district of Arabia, and by the 16th century it was known in the rest of the Middle East, Persia, Turkey, and North Africa. Coffee houses, known as qahveh khaneh, began to appear in cities across the Near East. They became important centres of social activity, earning the name "Schools of the Wise."

Coffee eventually made its way to Europe in the 17th century. Initial resistance from religious authorities, who called it "the bitter invention of Satan," was overcome when Pope Clement VIII tasted the beverage and gave it papal approval. European coffee houses proliferated as places for political discussion and business deals — Lloyd's of London insurance company famously began as a coffee house.

The Dutch were the first to transport live coffee plants from the Arab world, establishing plantations in their colonies in Java and Sumatra. From Java, seedlings were sent to Amsterdam and then to France, where in the early 18th century a French naval officer named Gabriel de Clieu took a seedling to Martinique. Within 50 years, 18,680 coffee trees were growing on the island, and coffee cultivation spread across Central and South America.

Today, Brazil is the world's largest coffee producer, responsible for about one-third of global output. Vietnam and Colombia follow close behind. The global coffee market is worth over $400 billion annually, making coffee one of the world's most valuable commodities.`,
            questions: {
              create: [
                {
                  order: 1,
                  type: 'TRUE_FALSE_NOT_GIVEN',
                  prompt: 'Kaldi was a monk who discovered coffee while tending animals.',
                  correctAnswer: 'False',
                  explanation: 'Kaldi was described as a goat herder, not a monk.',
                  anchorText: 'goat herder',
                },
                {
                  order: 2,
                  type: 'TRUE_FALSE_NOT_GIVEN',
                  prompt: 'Coffee was being cultivated in Yemen during the 15th century.',
                  correctAnswer: 'True',
                  explanation: 'The passage states coffee was grown in the Yemeni district of Arabia by the 15th century.',
                  anchorText: 'Yemeni district',
                },
                {
                  order: 3,
                  type: 'TRUE_FALSE_NOT_GIVEN',
                  prompt: 'European coffee houses were initially welcomed by the Catholic Church.',
                  correctAnswer: 'False',
                  explanation: 'Religious authorities initially called it "the bitter invention of Satan."',
                  anchorText: 'bitter invention',
                },
                {
                  order: 4,
                  type: 'TRUE_FALSE_NOT_GIVEN',
                  prompt: 'Lloyd\'s of London was founded by a coffee merchant.',
                  correctAnswer: 'Not Given',
                  explanation: 'The passage only says Lloyd\'s began as a coffee house; nothing about its founder.',
                },
                {
                  order: 5,
                  type: 'MULTIPLE_CHOICE',
                  prompt: 'Who was responsible for introducing coffee cultivation to Martinique?',
                  options: ['A Dutch trader', 'Pope Clement VIII', 'A French naval officer', 'Gabriel de Clieu and his Dutch partner'],
                  correctAnswer: 'C',
                  explanation: 'Gabriel de Clieu, a French naval officer, took a seedling to Martinique.',
                },
                {
                  order: 6,
                  type: 'FILL_IN_THE_BLANK',
                  prompt: 'Middle Eastern coffee houses were sometimes called "Schools of the ___".',
                  correctAnswer: 'Wise',
                  explanation: 'The passage uses the exact phrase "Schools of the Wise."',
                },
                {
                  order: 7,
                  type: 'FILL_IN_THE_BLANK',
                  prompt: 'Brazil produces approximately one-___ of the world\'s coffee.',
                  correctAnswer: 'third',
                  explanation: 'The passage states "responsible for about one-third of global output."',
                },
              ],
            },
          },
          {
            order: 2,
            title: 'Urban Green Spaces and Mental Health',
            topic: 'Environment / Psychology',
            body: `Research consistently demonstrates a positive correlation between access to urban green spaces and improved mental health outcomes. A landmark study published in the journal Scientific Reports in 2019 found that spending at least 120 minutes per week in nature is associated with good health and wellbeing. Participants who spent more than two hours in natural settings reported significantly higher wellbeing scores compared to those with no nature contact.

The psychological benefits of green spaces operate through multiple mechanisms. First, natural environments engage what psychologist Stephen Kaplan termed "effortless attention" — the gentle, involuntary fascination one feels watching sunlight through leaves or rippling water. This contrasts with the directed attention required in urban environments, where constant stimulation leads to mental fatigue. Exposure to nature allows the prefrontal cortex — associated with decision-making and emotional regulation — to recover.

Second, physical activity in green spaces may be particularly restorative. A 2015 study from Stanford University found that participants who walked in natural settings showed decreased activity in the subgenual prefrontal cortex, a brain region associated with rumination, compared to those who walked in urban environments. This suggests that nature walks can reduce the repetitive negative thinking linked to depression.

Green spaces also foster social connections. Community gardens, parks, and neighbourhood greenways create informal meeting places, reducing social isolation — a major risk factor for mental health problems. Research has found that residents in greener neighbourhoods report higher levels of social cohesion and lower levels of aggression and violence.

Despite this evidence, urban green spaces are distributed inequitably across many cities. Lower-income neighbourhoods often have fewer parks, smaller green areas, and worse-maintained facilities. This "green gap" means that the mental health benefits of nature access are not equally available to all citizens, raising important questions about environmental justice and public health policy.`,
            questions: {
              create: [
                {
                  order: 8,
                  type: 'MULTIPLE_CHOICE',
                  prompt: 'According to the 2019 Scientific Reports study, what is the minimum weekly time in nature associated with wellbeing benefits?',
                  options: ['60 minutes', '90 minutes', '120 minutes', '180 minutes'],
                  correctAnswer: 'C',
                  explanation: 'The passage specifies "at least 120 minutes per week."',
                },
                {
                  order: 9,
                  type: 'MULTIPLE_CHOICE',
                  prompt: 'What does Stephen Kaplan\'s concept of "effortless attention" refer to?',
                  options: [
                    'The concentration required to navigate busy city streets',
                    'The involuntary fascination evoked by natural scenes',
                    'A meditation technique developed for urban dwellers',
                    'The ability to ignore distractions in natural environments',
                  ],
                  correctAnswer: 'B',
                  explanation: 'Kaplan defined it as "gentle, involuntary fascination" seen in nature.',
                },
                {
                  order: 10,
                  type: 'TRUE_FALSE_NOT_GIVEN',
                  prompt: 'The Stanford study found that urban walks increased rumination compared to nature walks.',
                  correctAnswer: 'True',
                  explanation: 'Urban walkers showed more activity in the region associated with rumination.',
                },
                {
                  order: 11,
                  type: 'TRUE_FALSE_NOT_GIVEN',
                  prompt: 'Community gardens are mentioned as places that encourage exercise.',
                  correctAnswer: 'Not Given',
                  explanation: 'The passage mentions community gardens as social meeting places, not specifically for exercise.',
                },
                {
                  order: 12,
                  type: 'FILL_IN_THE_BLANK',
                  prompt: 'The unequal distribution of parks across income levels is called the "green ___".',
                  correctAnswer: 'gap',
                  explanation: 'The passage uses the exact term "green gap."',
                },
                {
                  order: 13,
                  type: 'SHORT_ANSWER',
                  prompt: 'Which brain region is associated with decision-making and emotional regulation, according to the passage?',
                  correctAnswer: 'prefrontal cortex',
                  explanation: 'The passage explicitly names the prefrontal cortex.',
                },
              ],
            },
          },
          {
            order: 3,
            title: 'The Economics of Artificial Intelligence',
            topic: 'Technology / Economics',
            body: `Artificial intelligence is reshaping the global economy in ways that economists are only beginning to quantify. A McKinsey Global Institute report estimated that AI could contribute up to $13 trillion to global economic activity by 2030, adding 1.2 percentage points annually to GDP growth. Yet these aggregate gains mask significant distributional concerns about who benefits and who loses.

At the firm level, AI adoption creates competitive advantage by automating routine cognitive tasks, optimising supply chains, and enabling personalised products and services at scale. Early adopters tend to capture disproportionate gains: companies that integrated AI into their business models between 2016 and 2022 showed productivity improvements of up to 40% in specific functions, according to research from MIT. These gains compound over time, as AI systems improve with more data and usage.

The labour market implications are more contested. Standard economic theory predicts that technology displaces workers in certain tasks but creates new jobs and raises overall productivity and living standards — as happened with previous industrial revolutions. Optimists point to historical precedent: the mechanisation of agriculture freed workers for manufacturing; manufacturing automation freed workers for services. Each wave of automation ultimately increased employment and wages in aggregate.

Pessimists, however, argue that AI is qualitatively different from previous technologies because it can replicate cognitive as well as physical tasks. Goldman Sachs estimated in 2023 that AI could affect 300 million jobs globally, with administrative, legal, and financial roles facing significant exposure. Uniquely, white-collar professionals — historically shielded from automation — may be more vulnerable than manual workers.

Policy responses are coalescing around three areas: education reform to build AI-complementary skills, social insurance to support displaced workers, and regulation to ensure ethical AI deployment. Countries that successfully navigate this transition may gain a significant competitive advantage in the new economy; those that fail to adapt risk being left behind in an increasingly bifurcated global landscape.`,
            questions: {
              create: [
                {
                  order: 14,
                  type: 'MULTIPLE_CHOICE',
                  prompt: 'What annual GDP growth contribution does McKinsey attribute to AI by 2030?',
                  options: ['0.8 percentage points', '1.2 percentage points', '1.8 percentage points', '2.4 percentage points'],
                  correctAnswer: 'B',
                  explanation: 'The passage states "adding 1.2 percentage points annually to GDP growth."',
                },
                {
                  order: 15,
                  type: 'TRUE_FALSE_NOT_GIVEN',
                  prompt: 'Early AI adopters showed productivity improvements of up to 40% in some areas.',
                  correctAnswer: 'True',
                  explanation: 'The passage cites MIT research showing "productivity improvements of up to 40%."',
                },
                {
                  order: 16,
                  type: 'TRUE_FALSE_NOT_GIVEN',
                  prompt: 'Standard economic theory predicts that AI will cause permanent structural unemployment.',
                  correctAnswer: 'False',
                  explanation: 'Standard theory predicts technology creates new jobs and raises living standards overall.',
                },
                {
                  order: 17,
                  type: 'TRUE_FALSE_NOT_GIVEN',
                  prompt: 'Goldman Sachs published a 2023 report on AI and the labour market.',
                  correctAnswer: 'True',
                  explanation: 'The passage explicitly states "Goldman Sachs estimated in 2023."',
                },
                {
                  order: 18,
                  type: 'MULTIPLE_CHOICE',
                  prompt: 'What does the passage say makes AI qualitatively different from previous technologies?',
                  options: [
                    'It operates faster than human workers',
                    'It can automate both cognitive and physical tasks',
                    'It creates more jobs than it displaces',
                    'It is regulated by international bodies',
                  ],
                  correctAnswer: 'B',
                  explanation: 'The passage states AI "can replicate cognitive as well as physical tasks."',
                },
                {
                  order: 19,
                  type: 'FILL_IN_THE_BLANK',
                  prompt: 'The three policy areas mentioned are education reform, social ___, and regulation.',
                  correctAnswer: 'insurance',
                  explanation: '"Social insurance to support displaced workers" is listed in the passage.',
                },
                {
                  order: 20,
                  type: 'SHORT_ANSWER',
                  prompt: 'According to Goldman Sachs, how many jobs globally could be affected by AI?',
                  correctAnswer: '300 million',
                  explanation: 'The passage states "300 million jobs globally."',
                },
              ],
            },
          },
        ],
      },
    },
  })

  console.log(`Seeded test: ${test.id} — "${test.title}"`)
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect())
