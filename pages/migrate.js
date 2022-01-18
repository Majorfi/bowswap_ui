import	React					from	'react';
import	{YVempireContextApp}	from	'contexts/useYVempire';
import	YVempire				from	'components/YVempire';

function	Index() {
	return <YVempire />;
}

Index.getLayout = function getLayout(page) {
	return (
		<YVempireContextApp>
			{page}
		</YVempireContextApp>
	);
};


export default Index;
