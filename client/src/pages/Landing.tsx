import { useRef, useState, useEffect } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import TextTransition, { presets } from 'react-text-transition';

import { Button } from '@components/common/Button';
import Card from '@components/common/Card';
import { SVGIconThemed } from '@components/SVGIcon/SVGIconThemed';
import SwapPreview from '@components/Landing/SwapPreview';
import { MAIN_CARDS, SECONDARY_CARDS } from '@helpers/cards';
import { Z_INDEX } from '@theme/zIndex';
import useMediaQuery from '@hooks/useMediaQuery';
import useQuery from '@hooks/useQuery';
import { ThemedText } from '@theme/text';


const CURRENCIES = ['USD', 'INR', 'TRY', 'EUR', 'GBP', 'SGD'];

export const Landing: React.FC = () => {
  /*
   * Contexts
   */
  
  const currentDeviceSize = useMediaQuery();

  const cardsRef = useRef<HTMLDivElement>(null);
  const { navigateWithQuery } = useQuery();

  /*
   * State
   */

  const [index, setIndex] = useState(0);

  /*
   * Hooks
   */

  useEffect(() => {
    const intervalId = setInterval(
      () => setIndex((index) => index + 1),
      3000,
    );
    return () => clearTimeout(intervalId);
  }, []);

  /*
   * Handlers
   */

  const navigateToSwapHandler = () => {
    navigateWithQuery('/swap');
  };

  const jumpToMedia = (url: string) => {
    window.open(url, '_blank');
  };

  return (
    <PageWrapper $isMobile={currentDeviceSize === 'tablet' || currentDeviceSize === 'mobile'}>
      <Container>
        <HeroContainer style={{ padding: currentDeviceSize === 'mobile' ? '0 1.6rem' : '0', width: currentDeviceSize === 'mobile' ? 'auto' : '50%' }}> 
          <SwapPreviewContainer onClick={() => navigateWithQuery('/swap')}>
            <SwapPreview />
          </SwapPreviewContainer>

          <HeroTextContainer>
            <ThemedText.Hero>
              <div style={{ display: 'flex', justifyContent: 'center', fontSize: currentDeviceSize === 'mobile' ? 44 : 60, fontWeight: 600 }}>
                <span>Onramp&nbsp;</span>
                <TextTransitionContainer>
                  <TextTransition 
                    springConfig={presets.stiff}
                    direction="down"
                    inline={true}
                    style={{
                      width: currentDeviceSize === 'mobile' ? '88px' : '128px',
                      height: currentDeviceSize === 'mobile' ? '48.5px' : '70.5px',
                      minWidth: currentDeviceSize === 'mobile' ? '88px' : '128px',
                      maxHeight: currentDeviceSize === 'mobile' ? '48.5px' : '70.5px',
                    }} 
                  >
                    {CURRENCIES[index % CURRENCIES.length]}
                  </TextTransition>
                </TextTransitionContainer>
              </div>
              
              <div style={{ width: '100%', textAlign: 'center', fontSize: currentDeviceSize === 'mobile' ? 44 : 60, fontWeight: 600 }}>in 90 seconds</div>
            </ThemedText.Hero>
          </HeroTextContainer>

          <SubHeaderContainer>
            <ThemedText.SubHeaderLarge style={{ textAlign: 'center', lineHeight: '1.3', fontSize: currentDeviceSize === 'mobile' ? 20 : 24 }}>
              Completely peer-to-peer leveraging everyday payment networks
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

          <TosPPContainer>
            <StyledLink as={Link} to="/tos">
              <ThemedText.LabelSmall textAlign="left">
                Terms of Service ↗
              </ThemedText.LabelSmall>
            </StyledLink>

            <StyledLink as={Link} to="/pp">
              <ThemedText.LabelSmall textAlign="left">
                Privacy Policy ↗
              </ThemedText.LabelSmall>
            </StyledLink>
          </TosPPContainer>
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

          <SignatureContainer>
            Made with<HeartIcon>♡</HeartIcon>
          </SignatureContainer>
          by the ZKP2P Team
        </AboutContainer>
      </Container>
    </PageWrapper>
  )
};

const PageWrapper = styled.div<{ $isMobile: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-bottom: 4rem;
  
  @media (min-width: 600px) {
    padding: 12px 8px;
    padding-bottom: 0rem;
  }
`;

const Container = styled.div`
  width: 100%;
  min-height: 535px;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: center;
  justify-content: flex-end;
  padding: 0 0 40px;
`;

const HeroContainer = styled.div`
  height: 100vh;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: center;
  justify-content: center;
  min-height: 535px;
  max-height: 1000px;
`;

const SwapPreviewContainer = styled.div`
  position: absolute;
  cursor: pointer;
  padding: 0 24px;
  margin-bottom: calc(360px + 32vw); 

  @media (min-width: 600px) {
    width: 450px;
    margin-bottom: 542px;
  }
`;

const ButtonContainer = styled.div`
  width: 150px;
  display: grid;
  padding-top: 1rem;
`;

const TosPPContainer = styled.div`
  display: flex;
  flex-direction: row;
  gap: 2rem;
`;

const StyledLink = styled.a`
  color: inherit;
  text-decoration: none;
  cursor: pointer;

  &:hover {
    text-decoration: underline;
  }
`;

const HeroTextContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding-top: 2rem;
  gap: 0.5rem;
  width: 100%;
  z-index: ${Z_INDEX.landing_hero};
`;

const TextTransitionContainer = styled.div`
  width: 88px;
  height: 48.5px;
  display: flex;
  justify-content: center;
  align-items: center;

  @media (min-width: 600px) {
    width: 128px;
    height: 70.5px;
  }
`;

const HeartIcon = styled.span`
  color: #DF2E2D;
  margin-top: -2px;
`;

const LearnMoreContainer = styled.div`
  display: flex;
  align-items: center;
  color: rgb(94, 94, 94);
  cursor: pointer;
  font-size: 20px;
  font-weight: 535;
  margin: 18px 0px 36px;
  padding-left: 12px;
  pointer-events: auto;
  gap: 8px;

  &:hover {
    opacity: 0.6;
  }
`;

const CardGrid = styled.div<{ cols: number }>`
  display: grid;
  gap: 32px;
  width: 100%;
  padding: 24px 0 0;
  max-width: 1440px;
  scroll-margin: 10px 0 0;

  grid-template-columns: ${({ cols }) => `repeat(${cols}, 1fr)`};
`;

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
  width: 24px;
  height: 24px;
  cursor: pointer;
  transition: opacity 0.2s ease-in-out;

  &:hover {
    opacity: 0.6;
  }
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

const IconRow = styled.div`
  display: flex;
  flex-direction: row;
  gap: 1.5rem;
  margin-top: 0.75rem;
`;

const SignatureContainer = styled.div`
  padding-top: 1rem;
  gap: 0.25rem;
  display: flex;
`;
