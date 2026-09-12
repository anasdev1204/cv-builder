from models.cv import CV


class CVStorage:

    async def get_cv(
        self,
        user_id: str
    ) -> CV | None:

        # TODO:
        # Download:
        #
        # bucket/
        #     {user_id}.json
        #
        # from Supabase Storage

        return None

    async def save_cv(
        self,
        user_id: str,
        cv: CV
    ) -> None:

        # TODO:
        # Serialize CV to JSON
        # Upload to:
        #
        # {user_id}.json

        pass