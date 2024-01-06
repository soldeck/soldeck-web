import { useCallback } from "react";
import { Button, Card, Col, Input, Row, Space, Tag } from "antd";
import TextArea from "antd/es/input/TextArea";
import { useProfiles } from "./profiles-utils";
import { Profile } from "./profiles-data-access";
import { chunkItems } from "../../lib/utils";

export const ProfileComponent = ({ profile }: { profile: Profile }) => {
  const profilesContext = useProfiles();

  const onChangeName = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      profile.name = event.target.value;
      profilesContext.updateProfile(profile);
    },
    [profile, profilesContext]
  );

  const onChangeAddresses = useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      profile.walletAddresses = event.target.value
        .split("\n")
        .map((_) => _.trim())
        .filter((_) => _);

      profilesContext.updateProfile(profile);
    },
    [profile, profilesContext]
  );

  const onSelectProfile = useCallback(() => {
    profilesContext.setActiveProfileId(profile.id);
  }, [profile.id, profilesContext]);

  const onDeleteProfile = useCallback(() => {
    profilesContext.deleteProfile(profile.id);
  }, [profile.id, profilesContext]);

  return (
    <Card
      className="mx-3 my-3"
      style={{ width: 500 }}
      title={
        <div className="">
          Profile Name:{" "}
          <Input
            defaultValue={profile.name}
            onChange={onChangeName}
            style={{ width: 250 }}
          />
          {profilesContext.activeProfileId === profile.id ? (
            <span className="px-1 t">
              <Tag color="#87d068">Active</Tag>
            </span>
          ) : null}
        </div>
      }
      actions={[
        <Button
          data-profile-id={profile.id}
          size="small"
          onClick={onSelectProfile}
        >
          Select
        </Button>,
        <Button
          data-profile-id={profile.id}
          size="small"
          onClick={onDeleteProfile}
        >
          Delete
        </Button>,
      ]}
    >
      Addresses (Separated by new line)
      <TextArea
        defaultValue={profile.walletAddresses.join("\n")}
        onChange={onChangeAddresses}
        rows={6}
      ></TextArea>
    </Card>
  );
};

export const ProfilesPage = () => {
  const profilesContext = useProfiles();

  const profileElements = chunkItems<Profile>(profilesContext.profiles, 2).map(
    (chunk, index) => {
      return (
        <Row key={index} className="py-3">
          <Col span={12}>
            <ProfileComponent profile={chunk[0]}></ProfileComponent>
          </Col>
          <Col span={12}>
            {chunk[1] ? (
              <ProfileComponent profile={chunk[1]}></ProfileComponent>
            ) : null}
          </Col>
        </Row>
      );
    }
  );

  return (
    <div>
      <div
        className="mx-auto py-6 sm:px-6 lg:px-8 text-center"
        style={{ width: 1200 }}
      >
        <Button
          size="small"
          onClick={() => {
            profilesContext.saveNewProfile(profilesContext.buildNewProfile());
          }}
        >
          Add Profile
        </Button>

        <Space
          direction="vertical"
          size="middle"
          style={{ display: "flex" }}
        ></Space>

        {profileElements}
      </div>
    </div>
  );
};
