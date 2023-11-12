import { SVGIconThemed } from '@components/SVGIcon/SVGIconThemed';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components'
import { colors } from 'theme/colors'

const StyledCard = styled.div<{ cursor: string }>`
	display: flex;
	background-color: #0D111C;
	background-size: auto 100%;
	background-position: right;
	background-repeat: no-repeat;
	background-origin: border-box;

	flex-direction: column;
	justify-content: space-between;
	text-decoration: none;
	color: ${({ theme }) => theme.neutral1};
	padding: 32px;
	height: 228px;
	border-radius: 24px;
	border: 1px solid #98a1c03d;
  cursor: ${({ cursor }) => cursor}};
`

const TitleRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`

const CardTitle = styled.div`
  font-size: 28px;
  line-height: 36px;
  font-weight: 535;
  color: ${colors.brandRed};
`

const CardDescription = styled.div`
  display: flex;
  flex-direction: column;
  font-size: 20px;
  line-height: 28px;
  color: white;
  padding: 0 40px 0 0;
  max-width: 480px;
`

const CardCTA = styled.div`
  color: ${colors.brandRed};
  font-weight: 535;
  font-size: 20px;
  line-height: 28px;
  margin: 24px 0px 0px;
  transition: opacity 250ms ease 0s;
  &:hover {
    opacity: 0.6;
  }
`

const Icon = styled(SVGIconThemed)`
  width: 20px;
  height: 20px;
`;

const Card = ({
  title,
  description,
  icon,
  cta,
  navigateTo,
}: {
  title: string
  description: string
  icon?: string
  cta?: string
  navigateTo?: string
}) => {
  const navigate = useNavigate()

  return (
		<StyledCard
      cursor={navigateTo ? 'pointer' : 'normal'}
      onClick={() =>
        navigateTo
          ? (navigateTo.startsWith('http') ? window.open(navigateTo, '_blank') : navigate(navigateTo))
          : null
      }
    >
			<TitleRow>
				<CardTitle>{title}</CardTitle>
				{icon ? <Icon icon={icon} /> : null}
			</TitleRow>
			<CardDescription>
				{description}
			</CardDescription>
      <CardCTA>
        {cta || ''}
      </CardCTA>
		</StyledCard>
  )
}

export default Card
