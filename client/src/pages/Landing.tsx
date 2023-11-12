import { MAIN_CARDS, SECONDARY_CARDS } from '../helpers/cards'
import { Button } from '../components/Button'
import Card from '../components/common/Card'
import { useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import { ThemedText } from '../theme/text'
import useMediaQuery from '@hooks/useMediaQuery'
import { SVGIconThemed } from '@components/SVGIcon/SVGIconThemed'
import SwapPreview from '@components/Landing/SwapPreview'

export const Landing: React.FC<{}> = () => {
  const currentDeviceSize = useMediaQuery();

  console.log('current device size', currentDeviceSize)
  const cardsRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  /*
  * Handlers
  */

  const navigateToSwapHandler = () => {
    navigate('/swap');
  };

  const jumpToMedia = (url: string) => {
    window.open(url, '_blank');
  };

  return (
    <PageWrapper>
        <Main>
          <Container>
            <HeroContainer>
              <SwapPreviewContainer onClick={() => navigate('/swap')}>
                <SwapPreview />
              </SwapPreviewContainer>
              <HeroTextContainer>
                <ThemedText.Hero style={{ textAlign: 'center', fontSize: currentDeviceSize === 'mobile' ? 48 : 64 }}>
                  Buy crypto with confidence
                </ThemedText.Hero>
              </HeroTextContainer>
              <SubHeaderContainer>
                <ThemedText.SubHeaderLarge style={{ textAlign: 'center', fontSize: currentDeviceSize === 'mobile' ? 18 : 20 }}>
                  Onramp and offramp USD peer-to-peer without trusting anyone
                </ThemedText.SubHeaderLarge>
              </SubHeaderContainer>
              <ButtonContainer>
                <Button
                  onClick={navigateToSwapHandler}
                >
                  Get Started
                </Button>
              </ButtonContainer>
              <LearnMoreContainer
                onClick={() => {
                  cardsRef?.current?.scrollIntoView({ behavior: 'smooth' })
                }}
              >
                Learn more
                <Icon icon="arrow-down" />
              </LearnMoreContainer>
            </HeroContainer>
            <CardContainer paddingHorizontal={currentDeviceSize === 'mobile' ? 24 : 96}>
              <CardGrid cols={currentDeviceSize === 'mobile' ? 1 : SECONDARY_CARDS.length} ref={cardsRef}>
                {SECONDARY_CARDS.map(card => (
                  <Card
                    {...card}
                    key={card.title}
                  />
                ))}
              </CardGrid>
              <CardGrid cols={currentDeviceSize === 'mobile' ? 1 : MAIN_CARDS.length}>
                {MAIN_CARDS.map(card => (
                  <Card
                    {...card}
                    key={card.title}
                  />
                ))}
              </CardGrid>
            </CardContainer>
            <AboutContainer>
              <AboutFooter>
                <IconRow>
                  <SocialIcon
                    icon={'twitter'}
                    onClick={() => jumpToMedia('https://twitter.com/zkp2p')}
                  />

                  <SocialIcon
                    icon={'github'}
                    onClick={() => jumpToMedia('https://github.com/zkp2p')}
                  />

                  <SocialIcon
                    icon={'telegram'}
                    onClick={() => jumpToMedia('https://t.me/+XDj9FNnW-xs5ODNl')}
                  />
                </IconRow>
              </AboutFooter>
              <SignatureContainer>
                Made with<HeartIcon>♡</HeartIcon>
              </SignatureContainer>
              by the ZKP2P Team
            </AboutContainer>
          </Container>
        </Main>
    </PageWrapper>
  )
}

const SwapPreviewContainer = styled.div`
  position: absolute;
  z-index: 10;
  margin-bottom: 520px;
  cursor: pointer;
  padding: 0px 48px;
  &:hover {
    transform: translateY(-5px); /* Move the element up by 5px on hover */
  }
`

const SignatureContainer = styled.div`
  padding-top: 1rem;
  gap: 0.25rem;
  display: flex;
`

const HeartIcon = styled.span`
  color: #DF2E2D;
`

const LearnMoreContainer = styled.div`
  align-items: center;
  color: rgb(94, 94, 94);
  cursor: pointer;
  font-size: 20px;
  font-weight: 535;
  margin: 18px 0 36px;
  display: flex;
  pointer-events: auto;
  gap: 8px;
  &:hover {
    opacity: 0.6;
  }
`

const CardGrid = styled.div<{ cols: number }>`
  display: grid;
  gap: 32px;
  width: 100%;
  padding: 24px 0 0;
  max-width: 1440px;
  scroll-margin: 10px 0 0;

  grid-template-columns: ${({ cols }) => `repeat(${cols}, 1fr)`};
`

const Icon = styled(SVGIconThemed)`
  width: 20px;
  height: 20px;
  cursor: pointer;
  transition: opacity 0.2s ease-in-out;

  &:hover {
    opacity: 0.6;
  }
`;

const SocialIcon = styled(SVGIconThemed)`
  width: 32px;
  height: 32px;
  cursor: pointer;
  transition: opacity 0.2s ease-in-out;

  &:hover {
    opacity: 0.6;
  }
`;

const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  padding: 12px 8px 0px;
`;

const Main = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: center;
  justify-content: flex-end;
  width: 100%;
  padding: 0 0 40px;
  min-height: 535px;
`;

const HeroContainer = styled.div`
  height: 100vh;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 535px;
  max-height: 1000px;
`;

const HeroTextContainer = styled.div`
  display: grid;
  flex-direction: column;
  padding-top: 2rem;
  gap: 1rem;
  z-index: 20;
`;

const SubHeaderContainer = styled.div`
  display: grid;
  justify-content: center;
  flex-direction: column;
  padding-top: 1rem;
  gap: 1rem;
`;

const CardContainer = styled.div<{ paddingHorizontal: number }>`
  display: grid;
  justify-content: center;
  flex-direction: column;
  gap: 1rem;
  padding: ${({ paddingHorizontal }) => `1rem ${paddingHorizontal}px 0`};
`;

const AboutContainer = styled.div`
  display: flex;
  justify-content: center;
  flex-direction: column;
  padding-top: 1rem;
  gap: 0.5rem;
  align-items: center;
  text-align: center;
`;

const AboutFooter = styled.div`
  display: flex;
`

const ButtonContainer = styled.div`
  display: grid;
  padding-top: 1rem;
  width: 150px;
`;

const IconRow = styled.div`
  display: flex;
  flex-direction: row;
  gap: 1rem;
  margin-top: 0.75rem;
`;
