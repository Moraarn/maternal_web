import { UserStatus, Trimester } from '@/store/useStore'

export interface Question {
  id: number
  tag: string
  text: string
  hint: string
}

export const getQuestions = (status: UserStatus, trimester?: Trimester): Question[] => {
  if (status === 'pregnant') {
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
      }
    ]
  }
  
  if (status === 'postpartum_early') {
    return [
      {
        id: 1,
        tag: 'Bleeding check',
        text: 'Are you soaking more than 2 pads in one hour?',
        hint: 'This is considered heavy postpartum bleeding'
      },
      {
        id: 2,
        tag: 'Bleeding check',
        text: 'Do you feel dizzy or faint when you stand up?',
        hint: 'Feeling lightheaded or like you might fall'
      },
      {
        id: 3,
        tag: 'Infection check',
        text: 'Do you have a fever or feel very hot and cold?',
        hint: 'Temperature above 38°C, or chills and shivering'
      },
      {
        id: 4,
        tag: 'Infection check',
        text: 'Is there a bad smell from your vaginal discharge?',
        hint: 'Foul-smelling discharge is a warning sign of infection'
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
