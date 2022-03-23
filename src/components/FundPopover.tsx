import styled from "@emotion/styled";
import Text from "antd/lib/typography/Text";
import { FundAllocation } from "models/funds";
import { FC } from "react";
import { formatNumberToPercentage, numberToUSDFormat } from "utils/balance";

interface FundPopoverProps {
  fundsAllocations: FundAllocation[];
}

const FundRowContainer = styled.div`
  display: flex;
`;

const FundRowItemContainer = styled.div`
  flex: 1;
  margin-right: 20px;
  &:last-child {
    margin-right: 0;
  }
`;

interface SimpleTextProps {
  color?: string;
  fontSize?: string;
  lineHeight?: string;
  fontWeight?: string;
}
const SimpleText = styled(Text)`
  font-weight: ${(props: SimpleTextProps) =>
    props["fontWeight"] ? props["fontWeight"] : "400"};
  color: ${(props: SimpleTextProps) =>
    props["color"] ? props["color"] : "#fff"};
  font-size: ${(props: SimpleTextProps) =>
    props["fontSize"] ? props["fontSize"] : "14px"};
  line-height: ${(props: SimpleTextProps) =>
    props["lineHeight"] ? props["lineHeight"] : "0px"};
`;

const FundPopover: FC<FundPopoverProps> = (props: FundPopoverProps) => (
  <div>
    <SimpleText color="#FFFFFF" fontSize="10px" fontWeight="700">
      Fund Composition
    </SimpleText>
    <div>
      {props.fundsAllocations.map((fundAllocation) => (
        <FundRowContainer key={fundAllocation.tokenName}>
          <FundRowItemContainer>
            <SimpleText color="#FFFFFF" fontSize="10px">
              {numberToUSDFormat(fundAllocation.tokenAmount)}
            </SimpleText>
          </FundRowItemContainer>
          <FundRowItemContainer>
            <SimpleText color="#FFFFFF" fontSize="10px" fontWeight="700">
              {fundAllocation.tokenName}
            </SimpleText>
          </FundRowItemContainer>
          <FundRowItemContainer>
            <SimpleText color="#FFFFFF" fontSize="10px">
              {formatNumberToPercentage(1 + fundAllocation.tokenPercentage)}
            </SimpleText>
          </FundRowItemContainer>
        </FundRowContainer>
      ))}
    </div>
  </div>
);

export default FundPopover;
