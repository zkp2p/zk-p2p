import styled from 'styled-components'

const Footer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 48px;
  max-width: 1440px;
`

const LogoSection = styled.div`
  display: flex;
  flex-direction: column;
`

const LogoSectionLeft = styled(LogoSection)`
  display: none;
`

const LogoSectionBottom = styled(LogoSection)`
  display: flex;
`

const StyledLogo = styled.img`
  width: 72px;
  height: 72px;
  display: none;
`

const SocialLinks = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
  margin: 20px 0 0 0;
`

const SocialLink = styled.a`
  display: flex;
`

const FooterLinks = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
`

const LinkGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 200px;
  margin: 20px 0 0 0;
`

const LinkGroupTitle = styled.span`
  font-size: 16px;
  line-height: 20px;
  font-weight: 535;
`

const Copyright = styled.span`
  font-size: 16px;
  line-height: 20px;
  margin: 1rem 0 0 0;
  color: ${({ theme }) => theme.neutral3};
`

export const AboutFooter = () => {
  return (
    <Footer>
      <LogoSectionLeft>
        <LogoSectionContent />
      </LogoSectionLeft>

      <FooterLinks>
        <LinkGroup>
          <LinkGroupTitle>App</LinkGroupTitle>
          <TextLink to="/swap">Swap</TextLink>
          <TextLink to="/tokens">Tokens</TextLink>
          <TextLink to="/pools">Pools</TextLink>
        </LinkGroup>
        <LinkGroup>
          <LinkGroupTitle>Protocol</LinkGroupTitle>
          <ExternalTextLink href="https://uniswap.org/community">Community</ExternalTextLink>
          <ExternalTextLink href="https://uniswap.org/governance">Governance</ExternalTextLink>
          <ExternalTextLink href="https://uniswap.org/developers">Developers</ExternalTextLink>
        </LinkGroup>
        <LinkGroup>
          <LinkGroupTitle>Company</LinkGroupTitle>
          <TraceEvent
            events={[BrowserEvent.onClick]}
            name={SharedEventName.ELEMENT_CLICKED}
            element={InterfaceElementName.CAREERS_LINK}
          >
            <ExternalTextLink href="https://boards.greenhouse.io/uniswaplabs">Careers</ExternalTextLink>
          </TraceEvent>
          <TraceEvent
            events={[BrowserEvent.onClick]}
            name={SharedEventName.ELEMENT_CLICKED}
            element={InterfaceElementName.BLOG_LINK}
          >
            <ExternalTextLink href="https://uniswap.org/blog">Blog</ExternalTextLink>
          </TraceEvent>
        </LinkGroup>
        <LinkGroup>
          <LinkGroupTitle>Get Help</LinkGroupTitle>
          <TraceEvent
            events={[BrowserEvent.onClick]}
            name={SharedEventName.ELEMENT_CLICKED}
            element={InterfaceElementName.SUPPORT_LINK}
          >
            <ExternalTextLink
              href="https://support.uniswap.org/hc/en-us/requests/new"
              target="_blank"
              rel="noopener noreferrer"
            >
              Contact Us
            </ExternalTextLink>
          </TraceEvent>
          <TraceEvent
            events={[BrowserEvent.onClick]}
            name={SharedEventName.ELEMENT_CLICKED}
            element={InterfaceElementName.SUPPORT_LINK}
          >
            <ExternalTextLink href="https://support.uniswap.org/hc/en-us">Help Center</ExternalTextLink>
          </TraceEvent>
        </LinkGroup>
      </FooterLinks>

      <LogoSectionBottom>
        <LogoSectionContent />
      </LogoSectionBottom>
    </Footer>
  )
}