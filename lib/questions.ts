import { UserStatus, Trimester } from '@/store/useStore'

export interface Question {
  id: number
  tag: string
  text: string
  hint: string
}

export const getQuestions = (status: UserStatus, trimester?: Trimester): Question[] => {
  // Handle postpartum_early as postpartum for consistency
  const normalizedStatus = status === 'postpartum_early' ? 'postpartum' : status;
  
  if (normalizedStatus === 'pregnant') {
    return [
      {
        id: 1,
        tag: 'Preeclampsia check',
        text: 'Have you had a severe headache in the last 2 days?',
        hint: 'Any headache that paracetamol does not relieve'
      },
      {
        id: 2,
        tag: 'Preeclampsia check',
        text: 'Do your face or hands look swollen or puffy?',
        hint: 'Swelling worse in the morning, or that doesn\'t go away'
      },
      {
        id: 3,
        tag: 'Preeclampsia check',
        text: 'Is your vision blurry or are you seeing flashing lights?',
        hint: 'Any changes in eyesight since yesterday'
      },
      {
        id: 4,
        tag: 'Preeclampsia check',
        text: 'Do you feel pain in the upper part of your belly?',
        hint: 'A dull or sharp pain under your ribs — not baby movement'
      },
      {
        id: 5,
        tag: 'Bleeding check',
        text: 'Are you bleeding from your vagina?',
        hint: 'Any amount of blood, even spotting'
      },
      {
        id: 6,
        tag: 'Infection check',
        text: 'Do you have fever or chills?',
        hint: 'Temperature above 38°C or feeling very cold'
      },
      {
        id: 7,
        tag: 'Baby movement check',
        text: 'Have you felt your baby move less than usual today?',
        hint: 'Fewer kicks, rolls, or flutters than normal'
      },
      {
        id: 8,
        tag: 'Water break check',
        text: 'Are you leaking fluid from your vagina?',
        hint: 'A gush or trickle of fluid that doesn\'t stop'
      }
    ]
  }
  
  if (normalizedStatus === 'postpartum') {
    return [
      {
        id: 9,
        tag: 'Postpartum hemorrhage',
        text: 'Are you bleeding heavily from your vagina?',
        hint: 'Soaking through more than one pad per hour'
      },
      {
        id: 10,
        tag: 'Postpartum infection',
        text: 'Do you have fever or chills?',
        hint: 'Temperature above 38°C or feeling very cold'
      },
      {
        id: 11,
        tag: 'Postpartum pain',
        text: 'Do you have severe pain in your belly or bottom?',
        hint: 'Pain that doesn\'t get better with pain medicine'
      },
      {
        id: 12,
        tag: 'Mental health check',
        text: 'Do you feel very sad or hopeless most of the time?',
        hint: 'Feelings that last more than 2 weeks'
      },
      {
        id: 13,
        tag: 'Breastfeeding check',
        text: 'Do you have pain, redness, or swelling in your breasts?',
        hint: 'Any breast problems while breastfeeding'
      },
      {
        id: 14,
        tag: 'Newborn fever',
        text: 'Does your baby feel hot to touch?',
        hint: 'Baby\'s body feels unusually warm'
      },
      {
        id: 15,
        tag: 'Newborn feeding',
        text: 'Is your baby having trouble feeding?',
        hint: 'Not feeding well, refusing feeds, or very weak'
      },
      {
        id: 16,
        tag: 'Newborn breathing',
        text: 'Is your baby having trouble breathing?',
        hint: 'Fast breathing, grunting, or chest pulling in'
      }
    ]
  }
  
  // Default questions for unknown or other statuses
  return [
    {
      id: 1,
      tag: 'General check',
      text: 'Have you had any severe pain in the last 2 days?',
      hint: 'Any pain that doesn\'t go away with rest'
    },
    {
      id: 2,
      tag: 'General check',
      text: 'Do you feel feverish or have you been shivering?',
      hint: 'Temperature above 38°C, or feeling very hot and cold'
    },
    {
      id: 3,
      tag: 'General check',
      text: 'Have you felt dizzy or faint recently?',
      hint: 'Feeling lightheaded or like you might fall'
    },
    {
      id: 4,
      tag: 'General check',
      text: 'Are you experiencing any unusual bleeding?',
      hint: 'Any bleeding that seems heavier than normal'
    }
  ]
}
